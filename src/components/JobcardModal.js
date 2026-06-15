import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaRobot, FaInfoCircle, FaListAlt, FaEdit } from 'react-icons/fa';
import * as drugService from '../services/drugService';
import * as hardwareService from '../services/hardwareService';

function JobcardModal({ show, handleClose, handleSave, handleNext, item }) {
    const [formData, setFormData] = useState({});
    const [dependencies, setDependencies] = useState({ dilutions: [], hardware: [] });
    const [error, setError] = useState('');
    const isEditMode = !!item?.jobcardId;

    // Load available dilutions and machines
    useEffect(() => {
        const fetchDependencies = async () => {
            if (!show) return;
            try {
                const [dilutions, hardware] = await Promise.all([
                    drugService.getAllDilutions(),
                    hardwareService.getAllHardware()
                ]);
                setDependencies({ dilutions, hardware });
            } catch (err) {
                setError('Failed to sync system dependencies.');
            }
        };
        fetchDependencies();
    }, [show]);

    // Populate data
    useEffect(() => {
        setError('');
        if (isEditMode) {
            setFormData({
                dilutionId: item.dilutionId || '',
                quantity: item.quantity || 1,
                emergencyLevel: item.emergencyLevel || 1,
                purpose: item.purpose || '',
                hardwareId: item.hardwareId || ''
            });
        } else {
            setFormData({
                dilutionId: '',
                quantity: 1, // Strictly forced to 1
                emergencyLevel: 1,
                purpose: ''
            });
        }
    }, [item, show, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSave = () => {
        if (!formData.dilutionId) {
            return setError("Medication selection is required.");
        }
        
        // Return updated values back to database safely
        const dataToSave = {
            dilutionId: parseInt(formData.dilutionId, 10),
            emergencyLevel: parseInt(formData.emergencyLevel, 10),
            purpose: formData.purpose,
            quantity: 1 // Keep locked to 1 for hardware safety
        };
        handleSave(dataToSave);
    };

    const onNextStep = () => {
        if (!formData.dilutionId) {
            setError('Please select a dilution product to continue.');
            return;
        }
        const jobcardData = {
            ...formData,
            quantity: 1 // Force 1
        };
        handleNext(jobcardData);
    };

    // Find the hardware name assigned to this job
    const assignedHardwareName = dependencies.hardware.find(h => h.hardwareId === item?.hardwareId)?.name || "Unassigned / Auto-Derived";

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title>
                    {isEditMode ? <><FaEdit className="me-2 text-warning"/> Modify Jobcard Specs - #{item.jobcardId}</> : <><FaListAlt className="me-2 text-warning"/> Create Jobcard - Step 1</>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
                
                <Form>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted">DILUTION PRODUCT</Form.Label>
                                <Form.Select 
                                    name="dilutionId" 
                                    value={formData.dilutionId || ''} 
                                    onChange={handleChange}
                                    style={{ height: '50px', borderRadius: '12px' }}
                                >
                                    <option value="">Select Target Formulation...</option>
                                    {dependencies.dilutions.map(d => <option key={d.dilutionId} value={d.dilutionId}>{d.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-muted">QUANTITY (LOCKED FOR HARDWARE SAFETY)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="quantity" 
                                    value={1} 
                                    disabled 
                                    style={{ height: '50px', borderRadius: '12px', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 'bold' }} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">EMERGENCY LEVEL (1-5)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="emergencyLevel" 
                                    min="1" max="5" 
                                    value={formData.emergencyLevel || ''} 
                                    onChange={handleChange}
                                    style={{ height: '50px', borderRadius: '12px' }} 
                                />
                            </Form.Group>
                        </Col>
                        
                        {/* READ-ONLY SYSTEM ASSIGNMENT */}
                        {isEditMode && (
                            <Col md={12}>
                                <h6 className="text-uppercase small fw-bold text-primary mb-3 mt-2"><FaRobot className="me-2"/>System Assignment</h6>
                                <div className="p-3 rounded-3 bg-white border d-flex align-items-center shadow-sm">
                                    <div className="bg-primary text-white p-3 rounded-3 me-3">
                                        <FaInfoCircle />
                                    </div>
                                    <div>
                                        <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Assigned Mixing Unit</div>
                                        <div className="fw-bold h5 mb-0 text-dark">{assignedHardwareName}</div>
                                    </div>
                                    <div className="ms-auto">
                                        <Badge bg="secondary" className="px-3 py-2">PREDEFINED BY PORT</Badge>
                                    </div>
                                </div>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={handleClose}>
                    Cancel
                </Button>
                {isEditMode ? (
                    <Button 
                        className="btn-custom-primary px-5 rounded-pill shadow" 
                        onClick={onSave}
                        disabled={formData.currentStatus === 'Completed'}
                    >
                        Save
                    </Button>
                ) : (
                    <Button 
                        className="btn-custom-primary px-5 rounded-pill shadow" 
                        onClick={onNextStep}
                        disabled={!formData.dilutionId}
                    >
                        Next
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default JobcardModal;