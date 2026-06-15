import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Table, Card, Spinner} from 'react-bootstrap';
import { FaTrash, FaFlask, FaKeyboard, FaCalculator, FaLock} from 'react-icons/fa'; 
import * as drugService from '../services/drugService';
import * as inventoryService from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';

function RecipeSelectionModal({ show, handleClose, handleSave, tempJobcardData }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [aiMessage, setAiMessage] = useState({ text: '', variant: 'info' });
    
    const [formulaData, setFormulaData] = useState(null);
    const [inventoryList, setInventoryList] = useState([]);
    
    const [mainOption, setMainOption] = useState('base'); 
    const [selectedFlowRate, setSelectedFlowRate] = useState(''); 
    
    const [baseIngredients, setBaseIngredients] = useState([]);
    const [customDraft, setCustomDraft] = useState([{ inventoryId: '', name: '', unit: '', requiredQuantity: 1 }]);

    const isManual = mainOption === 'custom';

    // --- NEW: DYNAMIC HARDWARE LOCK FOR MANUAL/CUSTOM ENTRY ---
    // Evaluates your custom draft to see if a machine lock is active
    const lockedHardwareId = useMemo(() => {
        const activeList = mainOption === 'base' ? baseIngredients : customDraft;
        const selectedIngredient = activeList.find(ing => ing.inventoryId);
        if (!selectedIngredient) return null;
        
        const matchedInventoryItem = inventoryList.find(inv => inv.inventoryId === parseInt(selectedIngredient.inventoryId, 10));
        return matchedInventoryItem?.hardwareId || null;
    }, [baseIngredients, customDraft, inventoryList, mainOption]);

    // Helper to get only compatible inventory items
    const getFilteredInventoryList = () => {
        if (!lockedHardwareId) return inventoryList;
        return inventoryList.filter(inv => inv.hardwareId === lockedHardwareId);
    };

    // Find the name of the locked machine for the alert banner
    const activeMachineName = useMemo(() => {
        if (!lockedHardwareId || inventoryList.length === 0) return null;
        const matchedItem = inventoryList.find(inv => inv.hardwareId === lockedHardwareId);
        return matchedItem?.Hardware?.name || "Target Robotic Unit";
    }, [lockedHardwareId, inventoryList]);

    // Reusable helper to extract active list
    const getActiveIngredients = () => {
        if (mainOption === 'base') return baseIngredients;
        return customDraft;
    };

    // Live calculations matching the backend
    const liveCalculations = useMemo(() => {
        if (!formulaData || !tempJobcardData) return null;
        const weight = parseFloat(tempJobcardData.prescription?.weight) || 0;
        const activeList = mainOption === 'base' ? baseIngredients : customDraft;

        if (formulaData.formulaType === 'Bolus') {
            const ratio = parseFloat(formulaData.bolusDosePerKg) || 0;
            const targetDose = weight * ratio; 

            const apiIngredient = activeList.find(ing => {
                const inv = inventoryList.find(i => i.inventoryId === parseInt(ing.inventoryId, 10));
                const category = inv?.category || ing.category;
                return category === 'API';
            });

            if (apiIngredient) {
                const apiInventory = inventoryList.find(i => i.inventoryId === parseInt(apiIngredient.inventoryId, 10));
                const apiConcentration = parseFloat(apiInventory?.concentration) || 0; 
                const recommendedVolume = apiConcentration > 0 ? (targetDose / apiConcentration).toFixed(2) : 0;
                const volumeEntered = parseFloat(apiIngredient.requiredQuantity) || 0;
                const actualDoseDelivered = (volumeEntered * apiConcentration).toFixed(1);

                return {
                    type: 'Bolus',
                    isCustom: mainOption === 'custom',
                    targetDose: targetDose.toFixed(1),
                    recommendedVolume,
                    actualDoseDelivered,
                    ratio
                };
            }

            return { type: 'Bolus', targetDose: targetDose.toFixed(1), ratio, recommendedVolume: 0, actualDoseDelivered: 0 };
        } else {
            const apiIngredient = activeList.find(ing => {
                const inv = inventoryList.find(i => i.inventoryId === parseInt(ing.inventoryId, 10));
                return inv?.category === 'API';
            });
            const diluentIngredient = activeList.find(ing => {
                const inv = inventoryList.find(i => i.inventoryId === parseInt(ing.inventoryId, 10));
                return inv?.category === 'IV Fluid';
            });

            if (apiIngredient && diluentIngredient) {
                const apiInventory = inventoryList.find(i => i.inventoryId === parseInt(apiIngredient.inventoryId, 10));
                const apiVolumeUsed = parseFloat(apiIngredient.requiredQuantity) || 0;
                const apiConcentration = parseFloat(apiInventory?.concentration) || 0;
                const totalMass = apiVolumeUsed * apiConcentration;

                const diluentVolumeUsed = parseFloat(diluentIngredient.requiredQuantity) || 0;
                const totalVolume = apiVolumeUsed + diluentVolumeUsed;

                const finalConcentration = totalVolume > 0 ? (totalMass / totalVolume) : 0;
                const minRate = parseFloat(formulaData.infusionRateMin) || 0;
                const maxRate = parseFloat(formulaData.infusionRateMax) || 0;

                const flowMin = finalConcentration > 0 ? ((weight * minRate) / finalConcentration).toFixed(1) : 0;
                const flowMax = finalConcentration > 0 ? ((weight * maxRate) / finalConcentration).toFixed(1) : 0;

                return { type: 'Infusion', concentration: finalConcentration.toFixed(1), flowMin, flowMax, minRate, maxRate };
            }
        }
        return null;
    }, [formulaData, tempJobcardData, baseIngredients, customDraft, inventoryList, mainOption]);

    useEffect(() => {
        if (!show || !tempJobcardData?.dilutionId) return;

        const initSetup = async () => {
            setLoading(true); setError(''); setSelectedFlowRate('');
            try {
                const [dilutionRes, invRes] = await Promise.all([
                    drugService.getDilutionById(tempJobcardData.dilutionId),
                    inventoryService.getAllInventory()
                ]);
                setInventoryList(invRes);

                const formula = dilutionRes.Formula;
                if (formula) {
                    setFormulaData(formula);
                    const baseOnly = formula.FormulaDetails?.filter(d => !d.formulaPrescriptionId) || [];
                    const formattedBase = baseOnly.map(i => {
                        let requiredQty = parseFloat(i.requiredQuantity);
                        
                        if (formula.formulaType === 'Bolus' && formula.bolusDosePerKg) {
                            const weight = parseFloat(tempJobcardData.prescription.weight);
                            const targetDose = weight * parseFloat(formula.bolusDosePerKg);
                            const apiConcentration = parseFloat(i.Inventory?.concentration || 1);
                            if (apiConcentration > 0) {
                                requiredQty = parseFloat((targetDose / apiConcentration).toFixed(2));
                            }
                        }

                        return {
                            inventoryId: i.inventoryId, 
                            name: i.Inventory?.name || 'Unknown', 
                            unit: i.Inventory?.unit || '', 
                            requiredQuantity: requiredQty, 
                            hardwareId: i.Inventory?.hardwareId
                        };
                    });
                    setBaseIngredients(formattedBase);
                }
            } catch (err) { setError("Failed to synchronize formula details."); }
            finally { setLoading(false); }
        };

        initSetup();
    }, [show, tempJobcardData]);

    const handleSwitchMode = (mode) => {
        setMainOption(mode);
        if (mode === 'custom') {
            const baseOnly = formulaData?.FormulaDetails?.filter(d => !d.formulaPrescriptionId) || [];
            const baseApi = baseOnly.find(d => d.Inventory?.category === 'API');

            if (formulaData?.formulaType === 'Bolus' && baseApi) {
                setCustomDraft([{
                    inventoryId: baseApi.inventoryId,
                    name: baseApi.Inventory?.name,
                    unit: baseApi.Inventory?.unit,
                    requiredQuantity: 1, 
                    hardwareId: baseApi.Inventory?.hardwareId,
                    category: 'API'
                }]);
            } else {
                setCustomDraft([{ inventoryId: '', name: '', unit: '', requiredQuantity: 1, hardwareId: null }]);
            }
        }
    };

    const handleCustomChange = (index, field, value) => {
        const updated = [...customDraft];
        if (field === 'inventoryId') {
            const item = inventoryList.find(inv => inv.inventoryId === parseInt(value, 10));
            updated[index] = { 
                ...updated[index], 
                inventoryId: value, 
                name: item?.name || '', 
                unit: item?.unit || '', 
                hardwareId: item?.hardwareId,
                category: item?.category 
            };
        } else {
            updated[index][field] = value;
        }
        setCustomDraft(updated);
    };

    const onSubmit = async () => {
        const activeList = getActiveIngredients();
        
        if (isManual && activeList.some(ing => !ing.inventoryId)) {
            return setError("Please fill out all custom ingredient selections.");
        }

        if (formulaData.formulaType === 'Infusion' && liveCalculations) {
            const rate = parseFloat(selectedFlowRate);
            const min = parseFloat(liveCalculations.flowMin);
            const max = parseFloat(liveCalculations.flowMax);
            
            if (isNaN(rate) || rate < min || rate > max) {
                return setError(`Dosage Protection Error: Target infusion rate must be between ${min} and ${max} mL/hr.`);
            }
        }

        try {
            const finalData = {
                ...tempJobcardData,
                userId: user.userId,
                hardwareId: activeList[0]?.hardwareId,
                selectedFlowRate: formulaData.formulaType === 'Infusion' ? parseFloat(selectedFlowRate) : null,
                customIngredients: mainOption === 'custom' ? activeList : null 
            };
            await handleSave(finalData);
        } catch (err) { setError(err.message); }
    };

    const filteredInventory = getFilteredInventoryList();

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaFlask className="me-2 text-warning" /> Step 3: Formulation Setup</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {error && <Alert variant="danger">{error}</Alert>}
                {aiMessage.text && <Alert variant={aiMessage.variant} className="border-0 shadow-sm d-flex align-items-center mb-3">{aiMessage.text}</Alert>}

                {/* --- NEW: REAL-TIME HARDWARE LOCK BANNER FOR CUSTOM ENTRY --- */}
                {isManual && lockedHardwareId && (
                    <Alert variant="success" className="border-0 shadow-sm d-flex align-items-center mb-3">
                        <FaLock className="me-3" size={18} />
                        <div>
                            <strong>Physical Safety Lock Active:</strong> Custom entries limited strictly to ingredients loaded on <strong>{activeMachineName}</strong> to prevent cross-machine port contamination.
                        </div>
                    </Alert>
                )}

                {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                    <Row>
                        <Col lg={4}>
                            <Card className="shadow-sm border-0 mb-3 rounded-4 p-3">
                                <h6 className="text-primary fw-bold text-uppercase small mb-3">Locked Parameters</h6>
                                <div className="small mb-2"><strong>Patient Age:</strong> {tempJobcardData?.prescription?.age} Yrs</div>
                                <div className="small mb-2"><strong>Patient Weight:</strong> {tempJobcardData?.prescription?.weight} kg</div>
                            </Card>

                            {/* LIVE PREVIEW CALCULATION CARD */}
                            {liveCalculations && (
                                <Card className="border-0 shadow-sm rounded-4 p-3 text-white mb-3" style={{ background: 'linear-gradient(135deg, #043873 0%, #022a54 100%)' }}>
                                    <h6 className="text-warning fw-bold text-uppercase small mb-3 d-flex align-items-center"><FaCalculator className="me-2"/>Pharmacokinetics</h6>
                                    {liveCalculations.type === 'Bolus' ? (
                                        liveCalculations.isCustom ? (
                                            <div>
                                                <div className="small opacity-75 mb-1">BOLUS RATIO: {liveCalculations.ratio} mg/kg</div>
                                                <div className="small opacity-75 mb-1">TARGET DOSE: {liveCalculations.targetDose} mg</div>
                                                <div className="small opacity-75 mb-1">RECOMMENDED VOL: {liveCalculations.recommendedVolume} mL</div>
                                                <div className="small opacity-50 mt-3 text-uppercase">Delivered Dose:</div>
                                                <div className="fw-bold h3 text-warning">
                                                    {liveCalculations.actualDoseDelivered} mg
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="small opacity-75 mb-1">BOLUS RATIO: {liveCalculations.ratio} mg/kg</div>
                                                <div className="small opacity-75 mb-1">TARGET DOSE: {liveCalculations.targetDose} mg</div>
                                                <div className="small opacity-50 mt-3 text-uppercase">Delivered Dose:</div>
                                                <div className="fw-bold h3 text-warning">
                                                    {liveCalculations.targetDose} mg
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div>
                                            <div className="small opacity-75 mb-1">CONCENTRATION: {liveCalculations.concentration} mg/mL</div>
                                            <div className="small opacity-75 mb-1">DOSING: {liveCalculations.minRate} - {liveCalculations.maxRate} mg/kg/hr</div>
                                            <div className="small opacity-50 mt-2">SAFE LIMITS:</div>
                                            <div className="fw-bold h4 text-warning">{liveCalculations.flowMin} to {liveCalculations.flowMax} mL/hr</div>
                                        </div>
                                    )}
                                </Card>
                            )}

                            {/* CLINICIAN FLEXIBLE TARGET RATE INPUT */}
                            {formulaData?.formulaType === 'Infusion' && (
                                <Card className="border-0 shadow-sm rounded-4 p-3 bg-white border">
                                    <Form.Group>
                                        <Form.Label className="small fw-bold text-primary">SELECT TARGET INFUSION RATE (mL/hr)</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            step="0.1" 
                                            required
                                            value={selectedFlowRate} 
                                            onChange={e => setSelectedFlowRate(e.target.value)} 
                                            placeholder="Enter rate..." 
                                            className="border-primary"
                                        />
                                        <Form.Text className="text-muted small">
                                            Enter a custom rate between your safe limits.
                                        </Form.Text>
                                    </Form.Group>
                                </Card>
                            )}
                        </Col>
                        
                        <Col lg={8}>
                            <h6 className="text-primary fw-bold text-uppercase small mb-3">Formulation Selection</h6>
                            <Row className="g-2 mb-3">
                                <Col md={6}><Card className={`h-100 border-2 cursor-pointer ${mainOption === 'base' ? 'border-primary' : 'border-white'}`} onClick={() => handleSwitchMode('base')}><Card.Body className="text-center py-2"><FaFlask className="mb-1 text-primary"/><div className="small fw-bold">Base Recipe</div></Card.Body></Card></Col>
                                <Col md={6}><Card className={`h-100 border-2 cursor-pointer ${mainOption === 'custom' ? 'border-warning' : 'border-white'}`} onClick={() => handleSwitchMode('custom')}><Card.Body className="text-center py-2"><FaKeyboard className="mb-1 text-warning"/><div className="small fw-bold">Manual Entry</div></Card.Body></Card></Col>
                            </Row>

                            <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="table-dark small">
                                        <tr><th>Ingredient</th><th>Quantity</th><th>Unit</th>{isManual && formulaData?.formulaType !== 'Bolus' && <th style={{ width: '50px' }}></th>}</tr>
                                    </thead>
                                    <tbody>
                                        {getActiveIngredients().map((ing, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {isManual ? (
                                                        formulaData?.formulaType === 'Bolus' ? (
                                                            <span className="fw-bold text-dark">{ing.name}</span>
                                                        ) : (
                                                            <Form.Select size="sm" value={ing.inventoryId} onChange={e => handleCustomChange(idx, 'inventoryId', e.target.value)}>
                                                                <option value="">Select Item...</option>
                                                                {/* --- NEW: USES THE FILTERED COMPATIBLE INGREDIENTS LIST FOR CUSTOM ENTRIES --- */}
                                                                {filteredInventory.map(inv => <option key={inv.inventoryId} value={inv.inventoryId}>{inv.name}</option>)}
                                                            </Form.Select>
                                                        )
                                                    ) : <span className="fw-bold">{ing.name}</span>}
                                                </td>
                                                <td>
                                                    <Form.Control type="number" size="sm" value={ing.requiredQuantity} readOnly={!isManual} 
                                                        onChange={e => handleCustomChange(idx, 'requiredQuantity', e.target.value)} 
                                                        style={!isManual ? { border: 'none', background: 'transparent', fontWeight: 'bold' } : {}}
                                                    />
                                                </td>
                                                <td className="text-muted small">{ing.unit}</td>
                                                {isManual && (
                                                    <td>
                                                        {formulaData?.formulaType !== 'Bolus' && (
                                                            <Button variant="link" className="text-danger p-0" onClick={() => setCustomDraft(customDraft.filter((_, i) => i !== idx))}>
                                                                <FaTrash />
                                                            </Button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {isManual && formulaData?.formulaType !== 'Bolus' && (
                                    <div className="p-2 border-top bg-light text-center">
                                        <Button variant="outline-primary" size="sm" onClick={() => setCustomDraft([...customDraft, { inventoryId: '', name: '', unit: '', requiredQuantity: 1, hardwareId: null }])}>+ Add Ingredient Row</Button>
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleClose}>Cancel</Button>
                <Button className="btn-custom-primary px-5 rounded-pill shadow-sm" onClick={onSubmit} disabled={loading}>Confirm & Create</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default RecipeSelectionModal;