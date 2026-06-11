import React from 'react';
import { Modal, Button, Row, Col, Table, Badge, Card } from 'react-bootstrap';
import { FaPrescription, FaFlask, FaServer, FaInfoCircle } from 'react-icons/fa';

function JobcardDetailsModal({ show, handleClose, jobcard }) {
    if (!jobcard) return null;

    // 1. Determine the source of ingredients
    let displayIngredients = [];
    
    if (jobcard.customIngredients) {
        // If Custom
        try {
            displayIngredients = typeof jobcard.customIngredients === 'string' 
                ? JSON.parse(jobcard.customIngredients) 
                : jobcard.customIngredients;
        } catch (e) { displayIngredients = []; }
    } else {
        // If Base or Standard (Already filtered by backend)
        displayIngredients = jobcard.Dilution?.Formula?.FormulaDetails || [];
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaInfoCircle className="me-2 text-warning" /> Technical Specification - Jobcard #{jobcard.jobcardId}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                
                <h6 className="text-uppercase fw-bold text-primary mb-3">Patient Context</h6>
                <Card className="border-0 shadow-sm mb-4 rounded-4 p-3 text-center">
                    <Row>
                        <Col><strong>Age:</strong> {jobcard.PrescriptionDetail?.age} Yrs</Col>
                        <Col><strong>Weight:</strong> {jobcard.PrescriptionDetail?.weight} kg</Col>
                        <Col><strong>Allergies:</strong> <span className="text-danger">{jobcard.PrescriptionDetail?.allergies || 'None'}</span></Col>
                    </Row>
                </Card>

                <h6 className="text-uppercase fw-bold text-primary mb-3">Locked Formulation</h6>
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                    <Table hover className="mb-0">
                        <thead className="table-dark small">
                            <tr><th>Ingredient Name</th><th>Qty</th><th className="text-center">Port</th></tr>
                        </thead>
                        <tbody>
                            {displayIngredients.map((ing, idx) => (
                                <tr key={idx}>
                                    <td className="fw-bold">{ing.Inventory?.name || ing.name}</td>
                                    <td>{ing.requiredQuantity} {ing.Inventory?.unit || ing.unit}</td>
                                    <td className="text-center">
                                        <Badge bg="info">PORT {ing.Inventory?.hardwarePort || ing.hardwarePort || 'N/A'}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                <div className="alert alert-info border-0 shadow-sm rounded-3">
                    <FaServer className="me-2"/> 
                    <strong>Machine Assignment:</strong> {jobcard.Hardware?.name || 'Waiting for assignment'}
                </div>
            </Modal.Body>
            <Modal.Footer><Button variant="secondary" className="rounded-pill px-4" onClick={handleClose}>Close Audit View</Button></Modal.Footer>
        </Modal>
    );
}

export default JobcardDetailsModal;