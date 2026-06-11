import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaRobot, FaInfoCircle,  FaListAlt } from 'react-icons/fa';
import * as drugService from '../services/drugService';
import * as hardwareService from '../services/hardwareService';
import { useAuth } from '../context/AuthContext';

function JobcardModal({ show, handleClose, handleSave, handleNext, item }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [dependencies, setDependencies] = useState({ dilutions: [], hardware: [] });
    const [error, setError] = useState('');
    const isEditMode = !!item?.jobcardId;

    // Load necessary data for dropdowns and displays
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

    // Initialize form based on current Jobcard state
    useEffect(() => {
        setError('');
        if (isEditMode) {
            setFormData({
                statusBool: item.status === 'Approved' || item.status === 'Completed',
                hardwareId: item.hardwareId || '',
                currentStatus: item.status
            });
        } else {
            setFormData({
                dilutionId: '',
                quantity: 1, // HARDCODED DEFAULT
                emergencyLevel: 1,
                purpose: ''
            });
        }
    }, [item, show, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const onSave = () => {
        const finalStatus = formData.statusBool ? 'Approved' : 'Pending';
        
        const dataToSave = {
            status: finalStatus,
            approvedByUserId: user.userId,
            hardwareId: item.hardwareId,
            approveDate: finalStatus === 'Approved' ? new Date().toISOString() : null
        };
        handleSave(dataToSave);
    };

    const onNextStep = () => {
        if (!formData.dilutionId) {
            setError('Please select a dilution product to continue.');
            return;
        }

        // FORCE QUANTITY TO 1 FOR HARDWARE SAFETY
        const jobcardData = {
            ...formData,
            quantity: 1 
        };
        handleNext(jobcardData);
    };

    // Find the machine name assigned to this job
    const assignedHardwareName = dependencies.hardware.find(h => h.hardwareId === item?.hardwareId)?.name || "Unassigned";

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title>
                    {isEditMode ? <><FaCheckCircle className="me-2 text-warning"/> Authorize Jobcard #{item.jobcardId}</> : <><FaListAlt className="me-2 text-warning"/> Create Jobcard - Step 1</>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
                
                {isEditMode ? (
                    <div className="approval-interface">
                        {/* BINARY STATUS TOGGLE */}
                        <div className={`p-4 rounded-4 border mb-4 shadow-sm transition-all ${formData.statusBool ? 'bg-white border-success' : 'bg-white border-warning'}`}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 className={`fw-bold mb-1 ${formData.statusBool ? 'text-success' : 'text-warning'}`}>
                                        {formData.statusBool ? 'APPROVED' : 'PENDING APPROVAL'}
                                    </h5>
                                    <p className="small text-muted mb-0">
                                        {formData.currentStatus === 'Completed' 
                                            ? "This medication has been successfully mixed." 
                                            : "Toggle to grant robotic execution permission."}
                                    </p>
                                </div>
                                <Form.Check 
                                    type="switch"
                                    id="approval-switch"
                                    name="statusBool"
                                    checked={formData.statusBool || false}
                                    onChange={handleChange}
                                    disabled={formData.currentStatus === 'Completed'}
                                    style={{ transform: 'scale(2)' }}
                                />
                            </div>
                        </div>

                        {/* HARDWARE INFO (VIEW ONLY) */}
                        <h6 className="text-uppercase small fw-bold text-primary mb-3"><FaRobot className="me-2"/>System Assignment</h6>
                        <div className="p-3 rounded-3 bg-white border d-flex align-items-center shadow-sm">
                            <div className="bg-primary text-white p-3 rounded-3 me-3">
                                <FaInfoCircle />
                            </div>
                            <div>
                                <div className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Assigned Mixing Unit</div>
                                <div className="fw-bold h5 mb-0 text-dark">{assignedHardwareName}</div>
                            </div>
                            <div className="ms-auto">
                                <Badge bg="secondary" className="px-3 py-2">READ ONLY</Badge>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* STEP 1: CREATION FORM */
                    <Form>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">DILUTION PRODUCT</Form.Label>
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
                                    <Form.Label className="small fw-bold">QUANTITY</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="quantity" 
                                        value={1} // STRICTLY LOCKED VALUE
                                        disabled  // UNCLICKABLE
                                        style={{ height: '50px', borderRadius: '12px', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 'bold' }} 
                                    />
                                    <Form.Text className="text-muted small">
                                        Note: Locked to 1 unit to prevent mechanical overflow in the physical mixing chamber.
                                    </Form.Text>
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
                        </Row>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleClose}>Close</Button>
                {isEditMode ? (
                    <Button 
                        className="btn-custom-primary px-5 rounded-pill shadow" 
                        onClick={onSave}
                        disabled={formData.currentStatus === 'Completed'}
                    >
                        Save Configuration
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