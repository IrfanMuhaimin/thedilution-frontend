import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function AddInventoryMasterModal({ show, handleClose, handleSave }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Reset form when modal is shown
        if (show) {
            setFormData({
                userId: user.userId,
                name: '',
                unit: 'pcs',
                initialStock: {
                    quantity: 1,
                    supplier: '',
                    batchNumber: '',
                    expired: ''
                }
            });
        }
    }, [show, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStockChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            initialStock: { ...prev.initialStock, [name]: value }
        }));
    };

    const onSave = () => {
        const dataToSave = {
            ...formData,
            initialStock: {
                ...formData.initialStock,
                quantity: parseInt(formData.initialStock.quantity, 10),
                expired: formData.initialStock.expired ? new Date(formData.initialStock.expired).toISOString() : null,
            }
        };
        handleSave(dataToSave);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton><Modal.Title>Add New Inventory Master</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form>
                    <h5>Master Details</h5>
                    <Row>
                        <Col md={8}><Form.Group className="mb-3"><Form.Label>Item Name</Form.Label><Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} /></Form.Group></Col>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Unit</Form.Label><Form.Select name="unit" value={formData.unit || ''} onChange={handleChange}><option>pcs</option><option>box</option><option>bottle</option><option>mL</option></Form.Select></Form.Group></Col>
                    </Row>
                    <hr />
                    <h5>Initial Stock Batch</h5>
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label>Quantity</Form.Label><Form.Control type="number" name="quantity" value={formData.initialStock?.quantity || ''} onChange={handleStockChange} min="1"/></Form.Group></Col>
                        <Col md={8}><Form.Group className="mb-3"><Form.Label>Supplier</Form.Label><Form.Control type="text" name="supplier" value={formData.initialStock?.supplier || ''} onChange={handleStockChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Batch Number</Form.Label><Form.Control type="text" name="batchNumber" value={formData.initialStock?.batchNumber || ''} onChange={handleStockChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Expiry Date</Form.Label><Form.Control type="date" name="expired" value={formData.initialStock?.expired || ''} onChange={handleStockChange} /></Form.Group></Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button className="btn-custom-primary" onClick={onSave}>Save Item</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddInventoryMasterModal;