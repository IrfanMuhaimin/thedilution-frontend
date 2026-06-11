import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaUserPlus, FaExclamationTriangle } from 'react-icons/fa';

function PatientParamsModal({ show, handleClose, handleNext, tempJobcardData }) {
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [allergies, setAllergies] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            setAge(''); setWeight(''); setAllergies(''); setError('');
        }
    }, [show]);

    const onNext = () => {
        setError('');

        // 1. Check if empty
        if (!age || !weight) {
            setError('Age and Weight are required to determine the recipe.');
            return;
        }

        const parsedAge = parseInt(age, 10);
        const parsedWeight = parseFloat(weight);

        // 2. CLINICAL SAFETY CHECK: Age validation (> 0)
        if (isNaN(parsedAge) || parsedAge <= 0) {
            setError('Safety Error: Patient Age must be a valid number greater than 0.');
            return;
        }

        // 3. CLINICAL SAFETY CHECK: Weight validation (> 0)
        if (isNaN(parsedWeight) || parsedWeight <= 0) {
            setError('Safety Error: Patient Weight must be a valid number greater than 0 kg.');
            return;
        }

        const patientData = {
            ...tempJobcardData,
            prescription: {
                age: parsedAge,
                weight: parsedWeight,
                allergies: allergies
            }
        };
        handleNext(patientData);
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaUserPlus className="me-2 text-warning" /> Step 2: Patient Parameters</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {error && (
                    <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" size={18} />
                        <div>{error}</div>
                    </Alert>
                )}
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">PATIENT AGE (YEARS)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    required 
                                    min="1" // Prevents arrow keys from going below 1
                                    value={age} 
                                    onChange={e => setAge(e.target.value)} 
                                    placeholder="e.g., 25" 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">PATIENT WEIGHT (KG)</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    step="0.1" 
                                    required 
                                    min="0.1" // Prevents arrow keys from going below 0.1
                                    value={weight} 
                                    onChange={e => setWeight(e.target.value)} 
                                    placeholder="e.g., 65.5" 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-muted">ALLERGIES / SPECIAL NOTES</Form.Label>
                                <Form.Control as="textarea" rows={3} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Type allergies or clinical notes..." />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={handleClose}>Cancel</Button>
                <Button className="btn-custom-primary px-5 rounded-pill shadow-sm" onClick={onNext}>
                    Next
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PatientParamsModal;