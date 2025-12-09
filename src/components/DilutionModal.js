import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import * as drugService from '../services/drugService';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const initialFormState = {
    name: '',
    purpose: '',
    formulaId: ''
};

function DilutionModal({ show, handleClose, handleSave, item }) {
    const { user } = useAuth(); // Get the current logged-in user
    const isAuthorized = user?.role !== 'Doctor'; // Check if the user is NOT a Doctor

    const [formulas, setFormulas] = useState([]);
    const [formData, setFormData] = useState(initialFormState);
    const isEditMode = !!item?.dilutionId;

    useEffect(() => {
        if (show) {
            const fetchFormulas = async () => {
                try {
                    const data = await drugService.getAllFormulas();
                    setFormulas(data);
                } catch (error) {
                    console.error("Failed to fetch formulas:", error);
                }
            };
            fetchFormulas();
        }
    }, [show]);

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData(initialFormState);
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSave = () => {
        handleSave({
            ...formData,
            formulaId: formData.formulaId ? parseInt(formData.formulaId, 10) : null,
            modifyDate: new Date().toISOString()
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Dilution' : 'Add New Dilution'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!isAuthorized && (
                    <Alert variant="warning">
                        Your role ('Doctor') does not have permission to add or modify dilutions.
                    </Alert>
                )}
                <fieldset disabled={!isAuthorized}>
                    <Form>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3" controlId="formDilutionName">
                                    <Form.Label>Dilution Name</Form.Label>
                                    <Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3" controlId="formPurpose">
                                    <Form.Label>Purpose</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="purpose" value={formData.purpose || ''} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                 <Form.Group className="mb-3" controlId="formFormulaId">
                                    <Form.Label>Formula</Form.Label>
                                    <Form.Select name="formulaId" value={formData.formulaId || ''} onChange={handleChange}>
                                        <option value="">Choose Formula...</option>
                                        {formulas.map(f => (
                                            <option key={f.formulaId} value={f.formulaId}>{f.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-custom-secondary" onClick={handleClose}>Close</Button>
                <Button className="btn-custom-primary" onClick={onSave} disabled={!isAuthorized}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DilutionModal;