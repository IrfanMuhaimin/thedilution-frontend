import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext'; // 1. Import the useAuth hook

function HardwareModal({ show, handleClose, handleSave, hardware }) {
    const { user } = useAuth(); // 2. Get the current logged-in user
    const isAdmin = user?.role === 'Admin'; // 3. Create a boolean to check if the user is an Admin

    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const isEditMode = !!hardware?.hardwareId;

    useEffect(() => {
        setError(''); 
        if (hardware) {
            setFormData({
                ...hardware,
                lastMaintenanceDate: hardware.lastMaintenanceDate 
                    ? format(parseISO(hardware.lastMaintenanceDate), 'yyyy-MM-dd') 
                    : ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                status: true,
                lastMaintenanceDate: ''
            });
        }
    }, [hardware, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.description) {
            setError('Hardware Name and Description are required fields.');
            return false;
        }
        setError('');
        return true;
    };

    const onSave = () => {
        if (!validateForm()) {
            return;
        }
        const dataToSave = { ...formData };
        if (dataToSave.lastMaintenanceDate) {
            dataToSave.lastMaintenanceDate = new Date(dataToSave.lastMaintenanceDate).toISOString();
        } else {
            dataToSave.lastMaintenanceDate = null;
        }
        handleSave(dataToSave);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Hardware' : 'Add New Hardware'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* --- 4. DISPLAY ALERTS BASED ON ROLE AND VALIDATION ERRORS --- */}
                {!isAdmin && (
                    <Alert variant="warning">
                        Only users with the 'Admin' role can add or modify hardware.
                    </Alert>
                )}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* We wrap the form in a <fieldset> and disable it if the user is not an admin */}
                <fieldset disabled={!isAdmin}>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Hardware Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Maintenance Date (Optional)</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="lastMaintenanceDate"
                                        value={formData.lastMaintenanceDate || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="d-flex align-items-center form-switch-custom">
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="switch"
                                        label="Hardware is Active"
                                        name="status"
                                        checked={formData.status || false}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-custom-secondary" onClick={handleClose}>
                    Close
                </Button>
                {/* --- 5. CONDITIONALLY DISABLE THE SAVE BUTTON --- */}
                <Button className="btn-custom-primary" onClick={onSave} disabled={!isAdmin}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default HardwareModal;