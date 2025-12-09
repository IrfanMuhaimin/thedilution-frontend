import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';
import * as inventoryService from '../services/inventoryService';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const initialFormState = {
    name: '',
    ingredients: [{ inventoryId: '', requiredQuantity: '' }]
};

function FormulaModal({ show, handleClose, handleSave, item }) {
    const { user } = useAuth(); // Get the current logged-in user
    const isAuthorized = user?.role !== 'Doctor'; // Check if the user is NOT a Doctor

    const [inventoryList, setInventoryList] = useState([]);
    const isEditMode = !!item?.formulaId;
    const [formData, setFormData] = useState(initialFormState);

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
        if (item && item.FormulaDetails) {
            setFormData({
                name: item.name,
                ingredients: item.FormulaDetails.map(d => ({
                    inventoryId: d.inventoryId,
                    requiredQuantity: d.requiredQuantity
                }))
            });
        } else {
            setFormData(initialFormState);
        }
    }, [item]);

    const handleNameChange = (e) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
    };

    const handleIngredientChange = (index, event) => {
        const updatedIngredients = [...formData.ingredients];
        updatedIngredients[index][event.target.name] = event.target.value;
        setFormData(prev => ({ ...prev, ingredients: updatedIngredients }));
    };

    const handleAddIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { inventoryId: '', requiredQuantity: '' }]
        }));
    };

    const handleRemoveIngredient = (index) => {
        const updatedIngredients = [...formData.ingredients];
        updatedIngredients.splice(index, 1);
        setFormData(prev => ({ ...prev, ingredients: updatedIngredients }));
    };

    const onSave = () => {
        const formattedIngredients = formData.ingredients.map(ing => ({
            inventoryId: parseInt(ing.inventoryId, 10),
            requiredQuantity: parseInt(ing.requiredQuantity, 10)
        })).filter(ing => ing.inventoryId && ing.requiredQuantity);

        handleSave({ name: formData.name, ingredients: formattedIngredients });
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Formula' : 'Add New Formula'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!isAuthorized && (
                    <Alert variant="warning">
                        Your role ('Doctor') does not have permission to add or modify formulas.
                    </Alert>
                )}
                <fieldset disabled={!isAuthorized}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formFormulaName">
                            <Form.Label>Formula Name</Form.Label>
                            <Form.Control type="text" name="name" value={formData.name} onChange={handleNameChange} />
                        </Form.Group>
                        
                        <hr />
                        <h5>Ingredients</h5>
                        
                        {formData.ingredients.map((ingredient, index) => (
                            <Row key={index} className="mb-3 align-items-end">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Inventory Item</Form.Label>
                                        <Form.Select name="inventoryId" value={ingredient.inventoryId} onChange={e => handleIngredientChange(index, e)}>
                                            <option value="">Choose Inventory...</option>
                                            {inventoryList.map(inv => (
                                                <option key={inv.inventoryId} value={inv.inventoryId}>{inv.name} (Unit: {inv.unit})</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Required Quantity</Form.Label>
                                        <Form.Control type="number" name="requiredQuantity" placeholder="e.g., 10" value={ingredient.requiredQuantity} onChange={e => handleIngredientChange(index, e)} />
                                    </Form.Group>
                                </Col>
                                <Col md={2} className="d-flex justify-content-start">
                                    <Button variant="outline-danger" onClick={() => handleRemoveIngredient(index)}>
                                        <FaTrash />
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                        
                        <Button className="btn-custom-secondary" onClick={handleAddIngredient}>
                            <FaPlus className="me-2" />Add Ingredient
                        </Button>
                    </Form>
                </fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-custom-secondary" onClick={handleClose}>Close</Button>
                <Button className="btn-custom-primary" onClick={onSave} disabled={!isAuthorized}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default FormulaModal;