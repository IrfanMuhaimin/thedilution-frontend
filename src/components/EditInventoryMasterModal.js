import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

function EditInventoryMasterModal({ show, handleClose, handleSave, item }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                unit: item.unit || 'pcs',
                hardwarePort: item.hardwarePort || ''
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSave = () => {
        handleSave(formData);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Master Item: {item?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Item Name</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                         <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Unit</Form.Label>
                                <Form.Select name="unit" value={formData.unit} onChange={handleChange}>
                                    <option>pcs</option><option>box</option><option>bottle</option><option>mL</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                             <Form.Group className="mb-3">
                                <Form.Label>Hardware Port</Form.Label>
                                <Form.Control type="text" name="hardwarePort" value={formData.hardwarePort} onChange={handleChange} placeholder="e.g., P1, V2..." />
                                <Form.Text className="text-muted">
                                  Assign a port for the robotic system (e.g., P1 for Pump 1).
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button className="btn-custom-primary" onClick={onSave}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditInventoryMasterModal;