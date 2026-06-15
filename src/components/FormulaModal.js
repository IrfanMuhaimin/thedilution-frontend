import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Card } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFlask, FaSlidersH, FaEdit, FaTimes, FaLock } from 'react-icons/fa';
import * as inventoryService from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';

function FormulaModal({ show, handleClose, handleSave, item }) {
    const { user } = useAuth();
    const isAuthorized = user?.role !== 'Doctor';

    const [inventoryList, setInventoryList] = useState([]);
    const [formData, setFormData] = useState({ name: '', formulaType: 'Bolus', bolusDosePerKg: '', infusionRateMin: '', infusionRateMax: '', ingredients: [{ inventoryId: '', requiredQuantity: '' }] });
    const isEditMode = !!item?.formulaId;

    useEffect(() => {
        if (show) {
            inventoryService.getAllInventory().then(data => setInventoryList(data));
        }
    }, [show]);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                formulaType: item.formulaType || 'Bolus',
                bolusDosePerKg: item.bolusDosePerKg || '',
                infusionRateMin: item.infusionRateMin || '',
                infusionRateMax: item.infusionRateMax || '',
                ingredients: item.FormulaDetails?.filter(d => !d.formulaPrescriptionId).map(d => ({
                    inventoryId: d.inventoryId,
                    requiredQuantity: d.requiredQuantity
                })) || [{ inventoryId: '', requiredQuantity: '' }]
            });
        } else {
            setFormData({ name: '', formulaType: 'Bolus', bolusDosePerKg: '', infusionRateMin: '', infusionRateMax: '', ingredients: [{ inventoryId: '', requiredQuantity: '' }] });
        }
    }, [item, show]);

    // --- NEW: DYNAMIC HARDWARE MATCH LOCKOUT ENGINE ---
    // Evaluates the active ingredients inside the modal to find if a machine lock is active
    const lockedHardwareId = (() => {
        const selectedIngredientWithHardware = formData.ingredients.find(ing => ing.inventoryId);
        if (!selectedIngredientWithHardware) return null;
        
        const matchedInventoryItem = inventoryList.find(inv => inv.inventoryId === parseInt(selectedIngredientWithHardware.inventoryId, 10));
        return matchedInventoryItem?.hardwareId || null;
    })();

    // Helper to get only the allowed inventory items for the dropdown
    const getFilteredInventoryList = () => {
        if (!lockedHardwareId) return inventoryList; // If nothing chosen yet, show everything
        
        // Show ONLY inventory items loaded on the same machine!
        return inventoryList.filter(inv => inv.hardwareId === lockedHardwareId);
    };

    const filteredInventory = getFilteredInventoryList();
    const activeMachineName = hardwareListFindName(lockedHardwareId);

    function hardwareListFindName(hwId) {
        if (!hwId || inventoryList.length === 0) return null;
        const matchedItem = inventoryList.find(inv => inv.hardwareId === hwId);
        return matchedItem?.Hardware?.name || "Target Robotic Unit";
    }

    const handleNameChange = (e) => setFormData(prev => ({ ...prev, name: e.target.value }));
    
    const handleTypeChange = (e) => {
        const type = e.target.value;
        setFormData(prev => {
            const updatedIngredients = type === 'Bolus' 
                ? [prev.ingredients[0] || { inventoryId: '', requiredQuantity: '' }] 
                : prev.ingredients;
                
            return { ...prev, formulaType: type, ingredients: updatedIngredients };
        });
    };

    const handleDoseChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleBaseIngredientChange = (index, e) => {
        const updated = [...formData.ingredients];
        updated[index][e.target.name] = e.target.value;
        setFormData(prev => ({ ...prev, ingredients: updated }));
    };

    const addBaseIngredient = () => {
        if (formData.formulaType === 'Bolus' && formData.ingredients.length >= 1) return;
        setFormData(prev => ({
            ...prev, ingredients: [...prev.ingredients, { inventoryId: '', requiredQuantity: '' }]
        }));
    };

    const removeBaseIngredient = (index) => {
        const updated = [...formData.ingredients];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, ingredients: updated }));
    };

    const onSave = () => {
        const formattedBaseIngredients = formData.ingredients
            .filter(ing => ing.inventoryId && ing.requiredQuantity)
            .map(ing => ({
                inventoryId: parseInt(ing.inventoryId, 10),
                requiredQuantity: parseFloat(ing.requiredQuantity)
            }));

        handleSave({
            name: formData.name,
            formulaType: formData.formulaType,
            bolusDosePerKg: formData.formulaType === 'Bolus' ? parseFloat(formData.bolusDosePerKg) : null,
            infusionRateMin: formData.formulaType === 'Infusion' ? parseFloat(formData.infusionRateMin) : null,
            infusionRateMax: formData.formulaType === 'Infusion' ? parseFloat(formData.infusionRateMax) : null,
            ingredients: formattedBaseIngredients
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title>
                    {isEditMode ? <><FaEdit className="me-2 text-warning"/> Edit Formula Specifications</> : <><FaPlus className="me-2 text-warning"/> Create New Formula</>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {!isAuthorized && <Alert variant="warning" className="border-0 shadow-sm">Only Pharmacists are authorized to configure recipes.</Alert>}
                <fieldset disabled={!isAuthorized}>
                    <Form>
                        <Row className="mb-4">
                            <Col md={8}>
                                <Form.Group controlId="formFormulaName">
                                    <Form.Label className="small fw-bold text-muted">FORMULA NAME</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. Paracetamol Solution" value={formData.name} onChange={handleNameChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="formFormulaType">
                                    <Form.Label className="small fw-bold text-muted">FORMULATION TYPE</Form.Label>
                                    <Form.Select value={formData.formulaType} onChange={handleTypeChange}>
                                        <option value="Bolus">Bolus (Direct Injection)</option>
                                        <option value="Infusion">Infusion (Continuous Dilution)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* HARDWARE LOCKOUT INDICATOR */}
                        {lockedHardwareId && (
                            <Alert variant="success" className="border-0 shadow-sm d-flex align-items-center mb-4">
                                <FaLock className="me-3" size={20} />
                                <div>
                                    <strong>Machine Lock Active:</strong> Recipe restricted exclusively to ingredients loaded on <strong>{activeMachineName}</strong> to prevent physical port cross-contamination.
                                </div>
                            </Alert>
                        )}

                        {/* DOSING CARDS */}
                        <Card className="mb-4 border-0 shadow-sm rounded-4">
                            <Card.Body className="p-4">
                                <h6 className="text-uppercase fw-bold text-primary mb-3"><FaSlidersH className="me-2"/>Dosing Configuration</h6>
                                {formData.formulaType === 'Bolus' ? (
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="small fw-bold text-warning">Target Ratio (mg/kg)</Form.Label>
                                                <Form.Control type="number" step="0.1" name="bolusDosePerKg" value={formData.bolusDosePerKg} onChange={handleDoseChange} placeholder="e.g., 5.0" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                ) : (
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-warning">Min Delivery Rate (mg/kg/hour)</Form.Label>
                                                <Form.Control type="number" step="0.1" name="infusionRateMin" value={formData.infusionRateMin} onChange={handleDoseChange} placeholder="e.g., 1.0" />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-warning">Max Delivery Rate (mg/kg/hour)</Form.Label>
                                                <Form.Control type="number" step="0.1" name="infusionRateMax" value={formData.infusionRateMax} onChange={handleDoseChange} placeholder="e.g., 4.0" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                            </Card.Body>
                        </Card>

                        <h5 className="mb-3 text-secondary d-flex align-items-center"><FaFlask className="me-2" /> Ingredients Definition</h5>
                        {formData.ingredients.map((ing, idx) => (
                            <Row key={idx} className="mb-3 align-items-end px-3">
                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-muted">SELECT INGREDIENT</Form.Label>
                                    <Form.Select name="inventoryId" value={ing.inventoryId} onChange={e => handleBaseIngredientChange(idx, e)}>
                                        <option value="">Choose item...</option>
                                        {/* --- RENDERS THE FILTERED COMPATIBLE INGREDIENTS LIST --- */}
                                        {filteredInventory.map(inv => <option key={inv.inventoryId} value={inv.inventoryId}>{inv.name} ({inv.category === 'API' ? 'API' : 'Diluent'})</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="small fw-bold text-muted">VOLUME (mL)</Form.Label>
                                    <Form.Control name="requiredQuantity" type="number" placeholder="Volume" value={ing.requiredQuantity} onChange={e => handleBaseIngredientChange(idx, e)} />
                                </Col>
                                <Col md={2}>
                                    <Button 
                                        variant="outline-danger" 
                                        className="w-100" 
                                        onClick={() => removeBaseIngredient(idx)}
                                        disabled={formData.formulaType === 'Bolus'}
                                    >
                                        <FaTrash />
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                        
                        {formData.formulaType !== 'Bolus' && (
                            <Button variant="link" className="px-3 text-decoration-none fw-bold" onClick={addBaseIngredient}>
                                + Add Ingredient Row
                            </Button>
                        )}
                    </Form>
                </fieldset>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={handleClose}><FaTimes/> Close</Button>
                <Button className="btn-custom-primary px-5 rounded-pill shadow-sm" onClick={onSave} disabled={!isAuthorized}>Save Recipe</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FormulaModal;