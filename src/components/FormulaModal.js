import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Card, InputGroup } from 'react-bootstrap';
import { FaPlus, FaTrash, FaUserMd, FaFlask, FaWeight, FaCalendarAlt } from 'react-icons/fa';
import * as inventoryService from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';

const initialFormState = {
    name: '',
    ingredients: [{ inventoryId: '', requiredQuantity: '' }]
};

function FormulaModal({ show, handleClose, handleSave, item }) {
    const { user } = useAuth();
    const isAuthorized = user?.role !== 'Doctor';

    const [inventoryList, setInventoryList] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const [standards, setStandards] = useState([]); // Array for Age/Weight based rules
    const isEditMode = !!item?.formulaId;

    useEffect(() => {
        if (show) {
            const fetchInventory = async () => {
                try {
                    const data = await inventoryService.getAllInventory();
                    setInventoryList(data);
                } catch (error) {
                    console.error("Failed to fetch inventory:", error);
                }
            };
            fetchInventory();
        }
    }, [show]);

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                ingredients: item.FormulaDetails?.filter(d => d.formulaPrescriptionId === 0 || !d.formulaPrescriptionId).map(d => ({
                    inventoryId: d.inventoryId,
                    requiredQuantity: d.requiredQuantity
                })) || [{ inventoryId: '', requiredQuantity: '' }]
            });

            // Map Prescription Standards if they exist
            if (item.PrescriptionStandards) {
                setStandards(item.PrescriptionStandards.map(s => ({
                    ...s,
                    ingredients: s.FormulaDetails?.map(d => ({
                        inventoryId: d.inventoryId,
                        requiredQuantity: d.requiredQuantity
                    })) || [{ inventoryId: '', requiredQuantity: '' }]
                })));
            } else {
                setStandards([]);
            }
        } else {
            setFormData(initialFormState);
            setStandards([]);
        }
    }, [item, show]);

    // --- General Formula Handlers ---
    const handleNameChange = (e) => setFormData(prev => ({ ...prev, name: e.target.value }));

    const handleBaseIngredientChange = (index, e) => {
        const updated = [...formData.ingredients];
        updated[index][e.target.name] = e.target.value;
        setFormData(prev => ({ ...prev, ingredients: updated }));
    };

    const addBaseIngredient = () => setFormData(prev => ({
        ...prev, ingredients: [...prev.ingredients, { inventoryId: '', requiredQuantity: '' }]
    }));

    const removeBaseIngredient = (index) => {
        const updated = [...formData.ingredients];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, ingredients: updated }));
    };

    // --- Prescription Standards Handlers ---
    const handleAddStandard = () => {
        setStandards([...standards, {
            description: '',
            minAge: 0, maxAge: 100,
            minWeight: 0, maxWeight: 200,
            ingredients: [{ inventoryId: '', requiredQuantity: '' }]
        }]);
    };

    const handleRemoveStandard = (index) => {
        const updated = [...standards];
        updated.splice(index, 1);
        setStandards(updated);
    };

    const handleStandardChange = (index, e) => {
        const updated = [...standards];
        updated[index][e.target.name] = e.target.value;
        setStandards(updated);
    };

    const handleStdIngredientChange = (stdIndex, ingIndex, e) => {
        const updated = [...standards];
        updated[stdIndex].ingredients[ingIndex][e.target.name] = e.target.value;
        setStandards(updated);
    };

    const addStdIngredient = (stdIndex) => {
        const updated = [...standards];
        updated[stdIndex].ingredients.push({ inventoryId: '', requiredQuantity: '' });
        setStandards(updated);
    };

    const removeStdIngredient = (stdIndex, ingIndex) => {
        const updated = [...standards];
        updated[stdIndex].ingredients.splice(ingIndex, 1);
        setStandards(updated);
    };

    const onSave = () => {
        const formattedBaseIngredients = formData.ingredients
            .filter(ing => ing.inventoryId && ing.requiredQuantity)
            .map(ing => ({
                inventoryId: parseInt(ing.inventoryId, 10),
                requiredQuantity: parseFloat(ing.requiredQuantity)
            }));

        const formattedStandards = standards.map(s => ({
            ...s,
            minAge: parseInt(s.minAge, 10),
            maxAge: parseInt(s.maxAge, 10),
            minWeight: parseFloat(s.minWeight),
            maxWeight: parseFloat(s.maxWeight),
            ingredients: s.ingredients
                .filter(ing => ing.inventoryId && ing.requiredQuantity)
                .map(ing => ({
                    inventoryId: parseInt(ing.inventoryId, 10),
                    requiredQuantity: parseFloat(ing.requiredQuantity)
                }))
        }));

        handleSave({
            name: formData.name,
            ingredients: formattedBaseIngredients,
            standards: formattedStandards
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Formula & Rules' : 'Add New Formula'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!isAuthorized && (
                    <Alert variant="warning">
                        Your role ('Doctor') does not have permission to modify formulas or standards.
                    </Alert>
                )}
                <fieldset disabled={!isAuthorized}>
                    <Form>
                        <Card className="mb-4 shadow-sm border-0 bg-light">
                            <Card.Body>
                                <Form.Group controlId="formFormulaName">
                                    <Form.Label className="fw-bold text-primary">Formula Name</Form.Label>
                                    <Form.Control type="text" size="lg" placeholder="e.g. Paracetamol Solution" value={formData.name} onChange={handleNameChange} />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        <h5 className="mb-3 d-flex align-items-center text-secondary">
                            <FaFlask className="me-2" /> Base Recipe (Default)
                        </h5>
                        {formData.ingredients.map((ing, idx) => (
                            <Row key={idx} className="mb-2 align-items-end px-3">
                                <Col md={6}>
                                    <Form.Select name="inventoryId" value={ing.inventoryId} onChange={e => handleBaseIngredientChange(idx, e)}>
                                        <option value="">Select Ingredient...</option>
                                        {inventoryList.map(inv => <option key={inv.inventoryId} value={inv.inventoryId}>{inv.name} ({inv.unit})</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={4}>
                                    <Form.Control name="requiredQuantity" type="number" placeholder="Qty" value={ing.requiredQuantity} onChange={e => handleBaseIngredientChange(idx, e)} />
                                </Col>
                                <Col md={2}>
                                    <Button variant="outline-danger" onClick={() => removeBaseIngredient(idx)}><FaTrash /></Button>
                                </Col>
                            </Row>
                        ))}
                        <Button variant="link" className="px-3 mb-4 text-decoration-none" onClick={addBaseIngredient}>
                            <FaPlus className="me-1" /> Add Ingredient
                        </Button>

                        <hr />
                        <h5 className="mb-3 d-flex align-items-center text-secondary">
                            <FaUserMd className="me-2" /> Age/Weight Specific Standards
                        </h5>

                        {standards.map((std, sIdx) => (
                            <Card key={sIdx} className="mb-4 border-primary-subtle shadow-sm">
                                <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                                    <Form.Control 
                                        className="border-0 fw-bold w-50" 
                                        name="description" 
                                        placeholder="Rule Description (e.g. Infant / Heavyweight)" 
                                        value={std.description} 
                                        onChange={e => handleStandardChange(sIdx, e)} 
                                    />
                                    <Button variant="outline-danger" size="sm" onClick={() => handleRemoveStandard(sIdx)}>
                                        <FaTrash className="me-1" /> Remove Rule
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="mb-4">
                                        <Col md={3}>
                                            <Form.Label><FaCalendarAlt className="me-1"/> Age Range (Years)</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control name="minAge" type="number" placeholder="Min" value={std.minAge} onChange={e => handleStandardChange(sIdx, e)} />
                                                <InputGroup.Text>to</InputGroup.Text>
                                                <Form.Control name="maxAge" type="number" placeholder="Max" value={std.maxAge} onChange={e => handleStandardChange(sIdx, e)} />
                                            </InputGroup>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Label><FaWeight className="me-1"/> Weight Range (kg)</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control name="minWeight" type="number" placeholder="Min" value={std.minWeight} onChange={e => handleStandardChange(sIdx, e)} />
                                                <InputGroup.Text>to</InputGroup.Text>
                                                <Form.Control name="maxWeight" type="number" placeholder="Max" value={std.maxWeight} onChange={e => handleStandardChange(sIdx, e)} />
                                            </InputGroup>
                                        </Col>
                                    </Row>

                                    <div className="bg-light p-3 rounded">
                                        <div className="fw-bold mb-2 small text-uppercase text-muted">Rule-Specific Ingredients:</div>
                                        {std.ingredients.map((ing, iIdx) => (
                                            <Row key={iIdx} className="mb-2">
                                                <Col md={6}>
                                                    <Form.Select name="inventoryId" size="sm" value={ing.inventoryId} onChange={e => handleStdIngredientChange(sIdx, iIdx, e)}>
                                                        <option value="">Select Item...</option>
                                                        {inventoryList.map(inv => <option key={inv.inventoryId} value={inv.inventoryId}>{inv.name}</option>)}
                                                    </Form.Select>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Control name="requiredQuantity" size="sm" type="number" placeholder="Qty" value={ing.requiredQuantity} onChange={e => handleStdIngredientChange(sIdx, iIdx, e)} />
                                                </Col>
                                                <Col md={2}>
                                                    <Button variant="outline-danger" size="sm" onClick={() => removeStdIngredient(sIdx, iIdx)}><FaTrash /></Button>
                                                </Col>
                                            </Row>
                                        ))}
                                        <Button variant="link" className="p-0 small text-decoration-none" onClick={() => addStdIngredient(sIdx)}>
                                            <FaPlus className="me-1" /> Add Rule Ingredient
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        <Button variant="outline-primary" className="w-100 py-3" style={{ borderStyle: 'dashed' }} onClick={handleAddStandard}>
                            <FaPlus className="me-2" /> Add New Prescription Rule
                        </Button>
                    </Form>
                </fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-custom-secondary" onClick={handleClose}>Close</Button>
                <Button className="btn-custom-primary" onClick={onSave} disabled={!isAuthorized}>
                    {isEditMode ? 'Update Formula & Rules' : 'Save Everything'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FormulaModal;