import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

// Assuming this modal is for adding a new batch of an existing stock item.
function StockBatchModal({ show, handleClose, handleSave, itemName }) {
    const [formData, setFormData] = useState({});

    // Reset form when the modal is shown for a new item
    useEffect(() => {
        if (show) {
            setFormData({
                batchNumber: '',
                quantity: 0,
                expiryDate: ''
            });
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // This is the function that was previously "unused"
    const onSave = () => {
        // Here you would typically pass the form data back to the parent component
        handleSave(formData);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Batch for: {itemName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Batch Number</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="batchNumber" 
                                    value={formData.batchNumber || ''} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="quantity" 
                                    value={formData.quantity || ''} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                             <Form.Group className="mb-3">
                                <Form.Label>Expiry Date</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    name="expiryDate" 
                                    value={formData.expiryDate || ''} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                {/* 
                  --- THIS IS THE FIX ---
                  The onClick handler is now correctly attached to the onSave function.
                  This tells the button to execute your onSave logic when it's clicked.
                */}
                <Button className="btn-custom-primary" onClick={onSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StockBatchModal;