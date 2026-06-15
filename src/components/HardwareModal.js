import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { FaHdd, FaLink, FaListOl, FaExclamationTriangle, FaTimes, FaSave } from 'react-icons/fa';

function HardwareModal({ show, handleClose, handleSave, hardware }) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';

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
                lastMaintenanceDate: '',
                apiEndpoint: '',
                digitalTwinUrl: '',
                availablePorts: 'P1,P2,P3,P4' // Default guideline
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
        // 1. Core Fields validation
        if (!formData.name || !formData.description) {
            setError('Hardware Name and Description are required fields.');
            return false;
        }
        
        // 2. COMPULSORY FIELD VALIDATION: API Handshake Endpoint
        if (!formData.apiEndpoint || !formData.apiEndpoint.trim()) {
            setError('Safety Error: API Handshake Endpoint (trigger.php URL) is compulsory. System cannot route commands without it.');
            return false;
        }

        // 3. COMPULSORY FIELD VALIDATION: Physical Ports list
        if (!formData.availablePorts || !formData.availablePorts.trim()) {
            setError('Safety Error: Physical Port Capacity is compulsory. System must allocate ports for inventory routing.');
            return false;
        }

        // Validate port list formatting (simple comma-separated regex)
        if (!/^P\d+(,P\d+)*$/.test(formData.availablePorts.replace(/\s/g, ''))) {
            setError('Format Error: Ports must be comma-separated values starting with capital P (e.g. P1,P2,P3).');
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
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title className="fw-bold">
                    <FaHdd className="me-2 text-warning" /> {isEditMode ? 'Edit Robotic Unit Specs' : 'Add New Robotic Unit'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {!isAdmin && (
                    <Alert variant="warning" className="border-0 shadow-sm">
                        Only administrators are authorized to add or configure hardware specifications.
                    </Alert>
                )}
                {error && (
                    <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" size={18} />
                        <div>{error}</div>
                    </Alert>
                )}

                <fieldset disabled={!isAdmin}>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">HARDWARE NAME</Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="e.g. Robotic Arm Alpha" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">DESCRIPTION</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="description" value={formData.description || ''} onChange={handleChange} placeholder="Describe the physical location or duties of this unit..." />
                                </Form.Group>
                            </Col>

                            {/* COMPULSORY HANDSHAKE ENDPOINT */}
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-warning"><FaLink className="me-1"/>API HANDSHAKE ENDPOINT (COMPULSORY)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="apiEndpoint" 
                                        placeholder="e.g. https://robot-alpha.thedilution.my/api" 
                                        value={formData.apiEndpoint || ''} 
                                        onChange={handleChange} 
                                        className="border-warning"
                                    />
                                    <Form.Text className="text-muted small d-block mt-1">
                                        <strong>Guide:</strong> Enter the absolute URL where the robot's `trigger.php` gateway is hosted (exclude the '/trigger.php' file).
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            {/* OPTIONAL DIGITAL TWIN */}
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">3D DIGITAL TWIN WEBGL URL (OPTIONAL)</Form.Label>
                                    <Form.Control type="text" name="digitalTwinUrl" placeholder="e.g. https://robot-alpha.thedilution.my/TheDilution3/" value={formData.digitalTwinUrl || ''} onChange={handleChange} />
                                    <Form.Text className="text-muted small">
                                        <strong>Guide:</strong> Enter the direct URL hosting the compiled Unity WebGL virtual simulation for real-time monitoring.
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            {/* COMPULSORY PORT CAPACITY */}
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-warning"><FaListOl className="me-1"/>PHYSICAL PORT CAPACITY (COMPULSORY)</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="availablePorts" 
                                        placeholder="e.g. P1,P2,P3,P4" 
                                        value={formData.availablePorts || ''} 
                                        onChange={handleChange} 
                                        className="border-warning"
                                    />
                                    <Form.Text className="text-muted small d-block mt-1">
                                        <strong>Guide:</strong> Input the comma-separated list of physical fluid ports available on the robot (e.g. <code>P1,P2,P3,P4</code>).
                                    </Form.Text>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">LAST MAINTENANCE DATE</Form.Label>
                                    <Form.Control type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate || ''} onChange={handleChange} />
                                </Form.Group>
                            </Col>

                            <Col md={12} className="d-flex align-items-center mt-2">
                                <Form.Group className="mb-3">
                                    <Form.Check type="switch" label="Mixing Unit is Online / Active" name="status" checked={formData.status || false} onChange={handleChange} className="fw-bold" style={{ transform: 'scale(1.1)' }} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </fieldset>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={handleClose}><FaTimes/> Cancel</Button>
                <Button className="btn-custom-primary px-5 rounded-pill shadow-sm" onClick={onSave} disabled={!isAdmin}>
                    <FaSave className="me-2"/> Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default HardwareModal;