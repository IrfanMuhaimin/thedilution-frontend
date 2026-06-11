import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import * as hardwareService from '../services/hardwareService';

function EditInventoryMasterModal({ show, handleClose, handleSave, item }) {
    const [formData, setFormData] = useState({});
    const [hardwareList, setHardwareList] = useState([]);

    useEffect(() => {
        if (show) {
            hardwareService.getAllHardware().then(data => setHardwareList(data));
        }
        if (item) {
            setFormData({
                name: item.name || '',
                unit: item.unit || 'pcs',
                hardwareId: item.hardwareId || '',
                hardwarePort: item.hardwarePort || ''
            });
        }
    }, [item, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSave = () => {
        handleSave({
            ...formData,
            hardwareId: parseInt(formData.hardwareId, 10)
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Master Item: {item?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Item Name</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Assigned Hardware</Form.Label>
                                <Form.Select name="hardwareId" value={formData.hardwareId} onChange={handleChange}>
                                    <option value="">Select Hardware...</option>
                                    {hardwareList.map(hw => (
                                        <option key={hw.hardwareId} value={hw.hardwareId}>{hw.name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Port</Form.Label>
                                <Form.Control type="text" name="hardwarePort" value={formData.hardwarePort} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                         <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Unit</Form.Label>
                                <Form.Select name="unit" value={formData.unit} onChange={handleChange}>
                                    <option>pcs</option><option>box</option><option>bottle</option><option>mL</option>
                                </Form.Select>
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