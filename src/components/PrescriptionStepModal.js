import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';

function PrescriptionStepModal({ show, handleClose, handleSave }) {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            setFormData({ age: '', weight: '', allergies: '' });
            setError('');
            setIsSaving(false);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSave = async () => {
        if (!formData.age || !formData.weight) {
            setError('Patient Age and Weight are required.');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const prescriptionData = {
                age: parseInt(formData.age, 10),
                weight: parseFloat(formData.weight),
                allergies: formData.allergies
            };
            await handleSave(prescriptionData); 

        } catch (err) {
            // This will now display the REAL error message from the API
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header>
                <Modal.Title>Step 2: Enter Prescription Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <p className="text-muted">Please provide the patient's details for this job card.</p>
                <Form>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Patient Age</Form.Label><Form.Control type="number" name="age" value={formData.age || ''} onChange={handleChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Patient Weight (kg)</Form.Label><Form.Control type="number" step="0.1" name="weight" value={formData.weight || ''} onChange={handleChange} /></Form.Group></Col>
                        <Col md={12}><Form.Group className="mb-3"><Form.Label>Allergies</Form.Label><Form.Control as="textarea" rows={3} name="allergies" value={formData.allergies || ''} onChange={handleChange} /></Form.Group></Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-custom-primary" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Submitting...</> : 'Submit Job Card'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PrescriptionStepModal;