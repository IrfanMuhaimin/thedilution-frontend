import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

// Import all necessary services to fetch items for the dropdowns
import * as jobcardService from '../services/jobcardService';
import * as inventoryService from '../services/inventoryService';
import * as hardwareService from '../services/hardwareService';
import * as consumptionService from '../services/consumptionService';

function ReportGenerationModal({ show, handleClose, handleGenerate }) {
    const { user } = useAuth();
    const [reportType, setReportType] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            if (!reportType) {
                setItems([]);
                return;
            }
            setLoading(true);
            setError('');
            try {
                let data = [];
                switch (reportType) {
                    case 'Jobcard':
                        data = await jobcardService.getAllJobcards();
                        break;
                    case 'Inventory':
                        data = await inventoryService.getAllInventory();
                        break;
                    case 'Hardware':
                        data = await hardwareService.getAllHardware();
                        break;
                    case 'Consumption':
                        data = await consumptionService.getAllConsumptions();
                        break;
                    default:
                        break;
                }
                setItems(data);
            } catch (err) {
                setError(`Failed to fetch ${reportType.toLowerCase()} items.`);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [reportType]);

    const onGenerate = () => {
        if (!reportType || !selectedId) {
            setError('Both report type and a specific item must be selected.');
            return;
        }
        const reportData = {
            type: reportType,
            id: parseInt(selectedId, 10),
            userId: user.userId
        };
        handleGenerate(reportData);
    };

    const renderItemOption = (item) => {
        switch (reportType) {
            case 'Jobcard':
                return `ID ${item.jobcardId} - ${item.Dilution?.name || 'N/A'}`;
            case 'Inventory':
                return `ID ${item.inventoryId} - ${item.name}`;
            case 'Hardware':
                return `ID ${item.hardwareId} - ${item.name}`;
            case 'Consumption':
                return `ID ${item.consumptionId} - ${item.Inventory?.name || 'N/A'} on ${new Date(item.consumptionDate).toLocaleDateString()}`;
            default:
                return '';
        }
    };
     const getItemId = (item) => {
        switch (reportType) {
            case 'Jobcard': return item.jobcardId;
            case 'Inventory': return item.inventoryId;
            case 'Hardware': return item.hardwareId;
            case 'Consumption': return item.consumptionId;
            default: return null;
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Generate New Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label>Report Type</Form.Label>
                                <Form.Select value={reportType} onChange={(e) => { setReportType(e.target.value); setSelectedId(''); }}>
                                    <option value="">Select a type...</option>
                                    <option value="Jobcard">Jobcard</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Consumption">Consumption</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {reportType && (
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Item to Report On</Form.Label>
                                    {loading ? <div className="text-center"><Spinner animation="border" size="sm" /></div> : (
                                        <Form.Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} disabled={!items.length}>
                                            <option value="">Select an item...</option>
                                            {items.map(item => (
                                                <option key={getItemId(item)} value={getItemId(item)}>
                                                    {renderItemOption(item)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    )}
                                </Form.Group>
                            </Col>
                        )}
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button className="btn-custom-primary" onClick={onGenerate} disabled={loading || !selectedId}>
                    Generate Report
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ReportGenerationModal;