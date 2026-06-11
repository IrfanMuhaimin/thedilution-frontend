import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import * as jobcardService from '../services/jobcardService';
import * as inventoryService from '../services/inventoryService';
import * as consumptionService from '../services/consumptionService';
import { FaFileMedical, FaCogs } from 'react-icons/fa';

function ReportGenerationModal({ show, handleClose, handleGenerate }) {
    const { user } = useAuth();
    const [reportType, setReportType] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            if (!reportType) { setItems([]); return; }
            setLoading(true); setError('');
            try {
                let data = [];
                if (reportType === 'Jobcard') data = await jobcardService.getAllJobcards();
                else if (reportType === 'Inventory') data = await inventoryService.getAllInventory();
                else if (reportType === 'Consumption') data = await consumptionService.getAllConsumptions();
                setItems(data);
            } catch (err) { setError(`Failed to fetch ${reportType.toLowerCase()} data.`); } 
            finally { setLoading(false); }
        };
        fetchItems();
    }, [reportType]);

    const onGenerate = () => {
        if (!reportType || !selectedId) return setError('Selection required.');
        handleGenerate({ type: reportType, id: parseInt(selectedId, 10), userId: user.userId });
    };

    const renderOption = (item) => {
        if (reportType === 'Jobcard') return `Jobcard #${item.jobcardId} - ${item.Dilution?.name || 'Manual'}`;
        if (reportType === 'Inventory') return `Item #${item.inventoryId} - ${item.name}`;
        if (reportType === 'Consumption') return `Log #${item.consumptionId} - ${item.Inventory?.name} (${new Date(item.consumptionDate).toLocaleDateString()})`;
    };

    const getId = (item) => item.jobcardId || item.inventoryId || item.consumptionId;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaFileMedical className="me-2 text-warning"/> Generate Clinical Report</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-primary">REPORT CATEGORY</Form.Label>
                                <Form.Select value={reportType} onChange={(e) => { setReportType(e.target.value); setSelectedId(''); }} className="shadow-sm border-0 py-2">
                                    <option value="">Select Audit Type...</option>
                                    <option value="Jobcard">Medication Execution Audit (Jobcard)</option>
                                    <option value="Inventory">Inventory FEFO Audit</option>
                                    <option value="Consumption">Material Traceability Log</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {reportType && (
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-primary">SELECT TARGET RECORD</Form.Label>
                                    {loading ? <Spinner animation="border" size="sm" className="ms-3 text-primary" /> : (
                                        <Form.Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} disabled={!items.length} className="shadow-sm border-0 py-2">
                                            <option value="">Choose record...</option>
                                            {items.map(item => <option key={getId(item)} value={getId(item)}>{renderOption(item)}</option>)}
                                        </Form.Select>
                                    )}
                                </Form.Group>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="bg-white border-0">
                <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleClose}>Cancel</Button>
                <Button className="btn-custom-primary rounded-pill px-4 shadow-sm" onClick={onGenerate} disabled={loading || !selectedId}>
                    <FaCogs className="me-2"/> Build Report
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ReportGenerationModal;