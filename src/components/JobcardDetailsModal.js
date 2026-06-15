import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Table, Badge, Card } from 'react-bootstrap';
import { FaPrescription, FaServer, FaInfoCircle, FaSlidersH, FaCalculator } from 'react-icons/fa';
import * as inventoryService from '../services/inventoryService';

function JobcardDetailsModal({ show, handleClose, jobcard }) {
    const [inventoryList, setInventoryList] = useState([]);

    // Load master inventory so we can dynamically look up missing Ports and Concentrations
    useEffect(() => {
        if (show) {
            inventoryService.getAllInventory()
                .then(data => setInventoryList(data))
                .catch(err => console.error("Details Modal Inventory Fetch Error:", err));
        }
    }, [show]);

    if (!jobcard) return null;

    const formula = jobcard.Dilution?.Formula || {};
    const isInfusion = jobcard.finalConcentration !== null && jobcard.finalConcentration !== undefined;

    // --- ULTRA-SAFE INGREDIENT PARSER ---
    let displayIngredients = [];
    
    if (jobcard.customIngredients) {
        if (Array.isArray(jobcard.customIngredients)) {
            displayIngredients = jobcard.customIngredients;
        } else if (typeof jobcard.customIngredients === 'string') {
            try {
                displayIngredients = JSON.parse(jobcard.customIngredients);
            } catch (e) {
                displayIngredients = [];
            }
        }
    } else {
        displayIngredients = jobcard.Dilution?.Formula?.FormulaDetails || [];
    }

    // Helper to dynamically find a port if it's missing in custom JSON
    const getPortForIngredient = (ing) => {
        const invId = ing.inventoryId || ing.Inventory?.inventoryId;
        const matchedItem = inventoryList.find(i => i.inventoryId === parseInt(invId, 10));
        return matchedItem?.hardwarePort || ing.hardwarePort || ing.Inventory?.hardwarePort || 'N/A';
    };

    // --- NEW: CLINICAL VOLUMETRIC DOSAGE RESOLVER ---
    // Calculates the actual volume dispensed for Bolus instead of showing the static base quantity
    const getDisplayQuantity = (ing) => {
        const invId = ing.inventoryId || ing.Inventory?.inventoryId;
        const matchedItem = inventoryList.find(i => i.inventoryId === parseInt(invId, 10));

        if (!isInfusion && formula.formulaType === 'Bolus' && jobcard.calculatedDose) {
            const apiConcentration = parseFloat(matchedItem?.concentration || 1);
            if (apiConcentration > 0) {
                // Exact Volume (mL) = Dose (mg) / Concentration (mg/mL)
                const exactVolume = (jobcard.calculatedDose / apiConcentration).toFixed(1);
                return `${exactVolume} mL`;
            }
        }
        
        // Default for Infusion or fallback
        return `${ing.requiredQuantity} ${matchedItem?.unit || ing.Inventory?.unit || ing.unit || 'mL'}`;
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title>
                    <FaInfoCircle className="me-2 text-warning" /> Technical Specification - Jobcard #{jobcard.jobcardId}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                
                {/* 1. Patient Parameters */}
                <h6 className="text-uppercase fw-bold text-primary mb-3"><FaPrescription className="me-2" /> Patient Parameters</h6>
                <Card className="border-0 shadow-sm mb-4 rounded-4 p-3 text-center">
                    <Row>
                        <Col className="border-end"><strong>Age:</strong> {jobcard.PrescriptionDetail?.age} Yrs</Col>
                        <Col className="border-end"><strong>Weight:</strong> {jobcard.PrescriptionDetail?.weight} kg</Col>
                        <Col><strong>Allergies:</strong> <span className="text-danger">{jobcard.PrescriptionDetail?.allergies || 'None'}</span></Col>
                    </Row>
                </Card>

                {/* 2. DYNAMIC PHARMACOKINETIC DOSAGE CARD */}
                <h6 className="text-uppercase fw-bold text-primary mb-3"><FaSlidersH className="me-2" /> Pharmacokinetic Calculation Matrix</h6>
                <Card className="border-0 shadow-sm mb-4 rounded-4 p-4 text-white" style={{ background: 'linear-gradient(135deg, #043873 0%, #022a54 100%)' }}>
                    {!isInfusion ? (
                        <Row className="align-items-center">
                            <Col md={6}>
                                <div className="small opacity-75">BOLUS DOSING RATIO</div>
                                <div className="fw-bold h4">{formula.bolusDosePerKg || '5'} mg/kg</div>
                            </Col>
                            <Col md={6} className="border-start-md ps-md-4">
                                <div className="small text-warning fw-bold">CALCULATED TARGET DOSE (mg)</div>
                                <div className="fw-bold h2 text-warning">{jobcard.calculatedDose} mg</div>
                            </Col>
                        </Row>
                    ) : (
                        <Row className="align-items-center">
                            <Col md={4} className="border-end-md">
                                <div className="small opacity-75">SAFE RATE LIMITS</div>
                                <div className="fw-bold h5">{formula.infusionRateMin || '1.0'} to {formula.infusionRateMax || '4.0'} mg/kg/hr</div>
                                <div className="small opacity-50 mt-1">({jobcard.calculatedFlowRateMin} to {jobcard.calculatedFlowRateMax} mL/hr)</div>
                            </Col>
                            <Col md={4} className="border-end-md ps-md-3">
                                <div className="small opacity-75">MIXTURE CONCENTRATION</div>
                                <div className="fw-bold h5 text-warning">{jobcard.finalConcentration} mg/mL</div>
                            </Col>
                            <Col md={4} className="ps-md-3">
                                <div className="small text-warning fw-bold">SELECTED TARGET RATE</div>
                                <div className="fw-bold h3 text-warning">
                                    <FaCalculator className="me-2 text-warning" size={18}/>
                                    {jobcard.selectedFlowRate} mL/hr
                                </div>
                            </Col>
                        </Row>
                    )}
                </Card>

                {/* 3. Ingredients Table */}
                <h6 className="text-uppercase fw-bold text-primary mb-3">Locked Formulation</h6>
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border mb-4">
                    <Table hover className="mb-0 align-middle">
                        <thead className="table-dark small">
                            <tr><th>Ingredient Name</th><th>Qty</th><th className="text-center">Port</th></tr>
                        </thead>
                        <tbody>
                            {displayIngredients.map((ing, idx) => (
                                <tr key={idx}>
                                    <td className="fw-bold">{ing.Inventory?.name || ing.name}</td>
                                    {/* --- FIXED: Displays the precise calculated volume here --- */}
                                    <td className="fw-bold text-success">{getDisplayQuantity(ing)}</td>
                                    <td className="text-center">
                                        <Badge bg="info">PORT {getPortForIngredient(ing)}</Badge>
                                    </td>
                                </tr>
                            ))}
                            {displayIngredients.length === 0 && (
                                <tr><td colSpan="3" className="text-center text-muted p-3">No locked ingredients found.</td></tr>
                            )}
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