import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import * as drugService from '../services/drugService';
import * as hardwareService from '../services/hardwareService';
import { useAuth } from '../context/AuthContext';

// This modal now handles TWO cases:
// 1. Editing an existing job card (the original functionality).
// 2. Step 1 of adding a new job card.
function JobcardModal({ show, handleClose, handleSave, handleNext, item }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [dependencies, setDependencies] = useState({ dilutions: [], hardware: [] });
    const [error, setError] = useState('');
    const isEditMode = !!item?.jobcardId;

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
                setError('Failed to load required data. ' + err.message);
            }
        };
        fetchDependencies();
    }, [show]);

    useEffect(() => {
        setError('');
        if (isEditMode) {
            setFormData({
                status: item.status || '',
                hardwareId: item.hardwareId || '',
            });
        } else {
            setFormData({
                dilutionId: '',
                quantity: 1,
                emergencyLevel: 1,
                purpose: ''
            });
        }
    }, [item, show, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onNext = () => {
        if (!formData.dilutionId) {
            setError('You must select a dilution to continue.');
            return;
        }
        const jobcardData = {
            dilutionId: parseInt(formData.dilutionId, 10),
            userId: user.userId,
            quantity: parseInt(formData.quantity, 10),
            status: 'Pending',
            emergencyLevel: parseInt(formData.emergencyLevel, 10),
            purpose: formData.purpose
        };
        handleNext(jobcardData); // Pass data to the parent and proceed to the next modal
    };

    const onSave = () => {
        const dataToSave = {
            status: formData.status,
            approvedByUserId: user.userId,
            hardwareId: formData.hardwareId ? parseInt(formData.hardwareId, 10) : null,
            approveDate: new Date().toISOString()
        };
        handleSave(dataToSave);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Update Job Card' : 'Step 1: Create New Job Card'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {isEditMode ? (
                    <Form> {/* Edit Mode Form */}
                        <Row>
                            <Col md={12}><Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Select name="status" value={formData.status || ''} onChange={handleChange}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Processing">Processing</option><option value="Completed">Completed</option><option value="Rejected">Rejected</option></Form.Select></Form.Group></Col>
                            <Col md={12}><Form.Group className="mb-3"><Form.Label>Assign Hardware</Form.Label><Form.Select name="hardwareId" value={formData.hardwareId || ''} onChange={handleChange}><option value="">Select Hardware...</option>{dependencies.hardware.map(hw => <option key={hw.hardwareId} value={hw.hardwareId}>{hw.name}</option>)}</Form.Select></Form.Group></Col>
                        </Row>
                    </Form>
                ) : (
                    <Form> {/* Add Mode Form (Step 1) */}
                        <Row>
                            <Col md={12}><Form.Group className="mb-3"><Form.Label>Dilution</Form.Label><Form.Select name="dilutionId" value={formData.dilutionId || ''} onChange={handleChange}><option value="">Select a Dilution...</option>{dependencies.dilutions.map(d => <option key={d.dilutionId} value={d.dilutionId}>{d.name}</option>)}</Form.Select></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Quantity</Form.Label><Form.Control type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Label>Emergency Level (1-5)</Form.Label><Form.Control type="number" name="emergencyLevel" min="1" max="5" value={formData.emergencyLevel || ''} onChange={handleChange} /></Form.Group></Col>
                            <Col md={12}><Form.Group className="mb-3"><Form.Label>Purpose / Notes</Form.Label><Form.Control as="textarea" rows={3} name="purpose" value={formData.purpose || ''} onChange={handleChange} /></Form.Group></Col>
                        </Row>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-custom-secondary" onClick={handleClose}>Cancel</Button>
                {isEditMode ? (
                    <Button className="btn-custom-primary" onClick={onSave}>Save Changes</Button>
                ) : (
                    <Button className="btn-custom-primary" onClick={onNext}>Next: Add Prescription</Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

export default JobcardModal;