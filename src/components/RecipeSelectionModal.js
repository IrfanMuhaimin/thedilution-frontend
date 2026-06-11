import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert, Table, Card } from 'react-bootstrap';
import { FaTrash, FaFlask, FaUserMd, FaKeyboard, FaExclamationCircle } from 'react-icons/fa'; 
import * as drugService from '../services/drugService';
import * as inventoryService from '../services/inventoryService';

function RecipeSelectionModal({ show, handleClose, handleSave, tempJobcardData }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [aiMessage, setAiMessage] = useState({ text: '', variant: 'info' });
    
    // Core Recipe States
    const [formulaData, setFormulaData] = useState(null);
    const [inventoryList, setInventoryList] = useState([]);
    
    const [mainOption, setMainOption] = useState('base'); // 'base' | 'standard' | 'custom'
    const [selectedStandardId, setSelectedStandardId] = useState('');
    
    // Split Ingredient States to preserve "Manual Draft" memory
    const [baseIngredients, setBaseIngredients] = useState([]);
    const [standardIngredients, setStandardIngredients] = useState([]);
    const [customDraft, setCustomDraft] = useState([{ inventoryId: '', name: '', unit: '', requiredQuantity: 1 }]);

    const isManual = mainOption === 'custom';

    useEffect(() => {
        if (!show || !tempJobcardData?.dilutionId) return;

        const initSetup = async () => {
            setLoading(true); setError(''); setAiMessage({ text: '', variant: 'info' });
            try {
                const [dilutionRes, invRes] = await Promise.all([
                    drugService.getDilutionById(tempJobcardData.dilutionId),
                    inventoryService.getAllInventory()
                ]);
                setInventoryList(invRes);

                const formula = dilutionRes.Formula;
                if (formula) {
                    setFormulaData(formula);

                    // 1. Map Base Ingredients
                    const baseOnly = formula.FormulaDetails?.filter(d => !d.formulaPrescriptionId) || [];
                    const formattedBase = baseOnly.map(i => ({
                        inventoryId: i.inventoryId, name: i.Inventory?.name || 'Unknown', unit: i.Inventory?.unit || '', requiredQuantity: i.requiredQuantity, hardwareId: i.Inventory?.hardwareId
                    }));
                    setBaseIngredients(formattedBase);

                    // 2. AUTO SUGGESTION ENGINE
                    const age = tempJobcardData.prescription.age;
                    const weight = tempJobcardData.prescription.weight;
                    const standards = formula.PrescriptionStandards || [];

                    // Find if any rule fits this patient's age and weight
                    const matchedRule = standards.find(std => 
                        age >= std.minAge && age <= std.maxAge &&
                        weight >= std.minWeight && weight <= std.maxWeight
                    );

                    if (matchedRule) {
                        setMainOption('standard');
                        setSelectedStandardId(matchedRule.formulaPrescriptionId);
                        
                        const stdIngredients = matchedRule.FormulaDetails || [];
                        setStandardIngredients(stdIngredients.map(i => ({
                            inventoryId: i.inventoryId, name: i.Inventory?.name || 'Unknown', unit: i.Inventory?.unit || '', requiredQuantity: i.requiredQuantity, hardwareId: i.Inventory?.hardwareId
                        })));

                        setAiMessage({
                            text: `Smart Match: Patient fits "${matchedRule.description}" criteria. Standard formulation loaded automatically!`,
                            variant: 'success'
                        });
                    } else {
                        // NO MATCH: Fallback to Base Recipe with warning
                        setMainOption('base');
                        setStandardIngredients([]);
                        setAiMessage({
                            text: `Notice: No predefined formula fits this patient's parameters. Please review or enter details manually using "Manual Entry".`,
                            variant: 'warning'
                        });
                    }
                }
            } catch (err) { setError("Failed to synchronize formula details."); }
            finally { setLoading(false); }
        };

        initSetup();
    }, [show, tempJobcardData]);

    const handleStandardSelect = (id) => {
        if (!id) return;
        setSelectedStandardId(id);
        const std = (formulaData?.PrescriptionStandards || []).find(s => s.formulaPrescriptionId === parseInt(id, 10));
        if (std) {
            setStandardIngredients((std.FormulaDetails || []).map(i => ({
                inventoryId: i.inventoryId, name: i.Inventory?.name || 'Unknown', unit: i.Inventory?.unit || '', requiredQuantity: i.requiredQuantity, hardwareId: i.Inventory?.hardwareId
            })));
        }
    };

    // Updates the draft without wiping standard/base
    const handleCustomChange = (index, field, value) => {
        const updated = [...customDraft];
        if (field === 'inventoryId') {
            const item = inventoryList.find(inv => inv.inventoryId === parseInt(value, 10));
            updated[index] = { 
                ...updated[index], 
                inventoryId: value, 
                name: item?.name || '', 
                unit: item?.unit || '', 
                hardwareId: item?.hardwareId 
            };
        } else {
            updated[index][field] = value;
        }
        setCustomDraft(updated);
    };

    const getActiveIngredients = () => {
        if (mainOption === 'base') return baseIngredients;
        if (mainOption === 'standard') return standardIngredients;
        return customDraft;
    };

    const onSubmit = async () => {
        const activeList = getActiveIngredients();
        if (isManual && activeList.some(ing => !ing.inventoryId)) {
            setError("Please fill out all custom ingredient selections.");
            return;
        }

        const assignedHardwareId = activeList[0]?.hardwareId;

        try {
            const finalData = {
                ...tempJobcardData,
                userId: user.userId,
                hardwareId: assignedHardwareId,
                selectedStandardId: mainOption === 'standard' ? parseInt(selectedStandardId, 10) : null,
                customIngredients: mainOption === 'custom' ? activeList : null 
            };
            await handleSave(finalData);
        } catch (err) { setError(err.message); }
    };

    const activeIngredients = getActiveIngredients();

    return (
        <Modal show={show} onHide={handleClose} size="xl" backdrop="static" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaFlask className="me-2 text-warning" /> Step 3: Formulation Setup</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-light p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {aiMessage.text && <Alert variant={aiMessage.variant} className="border-0 shadow-sm d-flex align-items-center"><FaExclamationCircle className="me-2"/>{aiMessage.text}</Alert>}

                {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                    <Row>
                        <Col lg={4}>
                            <Card className="shadow-sm border-0 mb-3 rounded-4 p-3">
                                <h6 className="text-primary fw-bold text-uppercase small mb-3">Locked Parameters</h6>
                                <div className="small mb-2"><strong>Patient Age:</strong> {tempJobcardData?.prescription?.age} Yrs</div>
                                <div className="small mb-2"><strong>Patient Weight:</strong> {tempJobcardData?.prescription?.weight} kg</div>
                                <div className="small mb-0"><strong>Special Notes:</strong> {tempJobcardData?.prescription?.allergies || 'None'}</div>
                            </Card>
                        </Col>
                        <Col lg={8}>
                            <h6 className="text-primary fw-bold text-uppercase small mb-3">Formulation Selection</h6>
                            <Row className="g-2 mb-3">
                                <Col md={4}><Card className={`h-100 border-2 cursor-pointer ${mainOption === 'base' ? 'border-primary' : 'border-white'}`} onClick={() => setMainOption('base')}><Card.Body className="text-center py-2"><FaFlask className="mb-1 text-primary"/><div className="small fw-bold">Base Recipe</div></Card.Body></Card></Col>
                                <Col md={4}><Card className={`h-100 border-2 cursor-pointer ${mainOption === 'standard' ? 'border-primary' : 'border-white'}`} onClick={() => setMainOption('standard')}><Card.Body className="text-center py-2"><FaUserMd className="mb-1 text-info"/><div className="small fw-bold">Predefined Rule</div></Card.Body></Card></Col>
                                <Col md={4}><Card className={`h-100 border-2 cursor-pointer ${mainOption === 'custom' ? 'border-warning' : 'border-white'}`} onClick={() => setMainOption('custom')}><Card.Body className="text-center py-2"><FaKeyboard className="mb-1 text-warning"/><div className="small fw-bold">Manual Entry</div></Card.Body></Card></Col>
                            </Row>

                            {mainOption === 'standard' && (
                                <Form.Select className="mb-3 border-info" style={{ backgroundColor: '#f0f9ff' }} value={selectedStandardId} onChange={(e) => handleStandardSelect(e.target.value)}>
                                    <option value="">Select standard rule...</option>
                                    {formulaData?.PrescriptionStandards?.map(s => <option key={s.formulaPrescriptionId} value={s.formulaPrescriptionId}>{s.description}</option>)}
                                </Form.Select>
                            )}

                            <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="table-dark small">
                                        <tr><th>Ingredient</th><th style={{ width: '130px' }}>Quantity</th><th>Unit</th>{isManual && <th style={{ width: '50px' }}></th>}</tr>
                                    </thead>
                                    <tbody>
                                        {activeIngredients.map((ing, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    {isManual ? (
                                                        <Form.Select size="sm" value={ing.inventoryId} onChange={e => handleCustomChange(idx, 'inventoryId', e.target.value)}>
                                                            <option value="">Select Item...</option>
                                                            {inventoryList.map(inv => <option key={inv.inventoryId} value={inv.inventoryId}>{inv.name}</option>)}
                                                        </Form.Select>
                                                    ) : <span className="fw-bold">{ing.name}</span>}
                                                </td>
                                                <td>
                                                    <Form.Control type="number" size="sm" value={ing.requiredQuantity} readOnly={!isManual} 
                                                        onChange={e => handleCustomChange(idx, 'requiredQuantity', e.target.value)} 
                                                        style={!isManual ? { border: 'none', background: 'transparent', fontWeight: 'bold' } : {}}
                                                    />
                                                </td>
                                                <td className="text-muted small">{ing.unit}</td>
                                                {isManual && <td><Button variant="link" className="text-danger p-0" onClick={() => setCustomDraft(customDraft.filter((_, i) => i !== idx))}><FaTrash /></Button></td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {isManual && (
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