import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaBoxes, FaSlidersH, FaFlask, FaLink } from 'react-icons/fa';
import * as hardwareService from '../services/hardwareService';
import * as inventoryService from '../services/inventoryService';

function AddInventoryMasterModal({ show, handleClose, handleSave }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [hardwareList, setHardwareList] = useState([]);
    const [inventoryList, setInventoryList] = useState([]);
    const [occupiedPorts, setOccupiedPorts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            setError('');
            // Load both Hardware and Inventory list to calculate port allocations
            Promise.all([
                hardwareService.getAllHardware(),
                inventoryService.getAllInventory()
            ])
            .then(([hwData, invData]) => {
                setHardwareList(hwData.filter(h => h.status && !h.isArchived));
                setInventoryList(invData);
            })
            .catch(() => setError("Failed to sync hardware port configurations."));

            setFormData({
                userId: user.userId,
                name: '',
                unit: 'mL', // Locked to mL
                category: 'API', 
                concentration: '',
                volume: '',
                hardwareId: '', 
                hardwarePort: '',
                initialStock: {
                    quantity: 1000,
                    supplier: '',
                    batchNumber: '',
                    expired: ''
                }
            });
        }
    }, [show, user]);

    // Calculate occupied ports whenever selected machine changes
    useEffect(() => {
        if (formData.hardwareId) {
            const taken = inventoryList
                .filter(item => item.hardwareId === parseInt(formData.hardwareId, 10))
                .map(item => item.hardwarePort);
            setOccupiedPorts(taken);
        } else {
            setOccupiedPorts([]);
        }
    }, [formData.hardwareId, inventoryList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStockChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            initialStock: { ...prev.initialStock, [name]: value }
        }));
    };

    // Calculate free physical ports
    const getAvailablePorts = () => {
        const selectedHw = hardwareList.find(h => h.hardwareId === parseInt(formData.hardwareId, 10));
        if (!selectedHw || !selectedHw.availablePorts) return [];
        
        const allPhysicalPorts = selectedHw.availablePorts.split(',');
        return allPhysicalPorts.filter(port => !occupiedPorts.includes(port.trim()));
    };

    const freePorts = getAvailablePorts();

    const onSave = () => {
        if (!formData.name || !formData.hardwareId || !formData.hardwarePort) {
            return setError("Please fill out all master item fields.");
        }

        const dataToSave = {
            ...formData,
            hardwareId: parseInt(formData.hardwareId, 10),
            concentration: formData.category === 'API' ? parseFloat(formData.concentration) : null,
            volume: formData.category === 'API' ? parseFloat(formData.volume) : null,
            initialStock: {
                ...formData.initialStock,
                quantity: parseInt(formData.initialStock.quantity, 10),
                expired: formData.initialStock.expired ? new Date(formData.initialStock.expired).toISOString() : null,
            }
        };
        handleSave(dataToSave);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaBoxes className="me-2 text-warning"/> Add New Inventory Master</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
                <Form>
                    <h6 className="text-uppercase fw-bold text-primary mb-3"><FaSlidersH className="me-2"/>Category & Hardware Mapping</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">ITEM NAME</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="e.g., Sodium Chloride" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">DRUG CATEGORY</Form.Label>
                                <Form.Select name="category" value={formData.category || 'API'} onChange={handleChange}>
                                    <option value="API">Active Pharmaceutical Ingredient (API)</option>
                                    <option value="IV Fluid">Intravenous (IV) Fluid / Diluent</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {/* API SPECIFIC FIELDS */}
                        {formData.category === 'API' && (
                            <>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-warning">CONCENTRATION (mg/mL)</Form.Label>
                                        <Form.Control type="number" step="0.1" name="concentration" value={formData.concentration || ''} onChange={handleChange} placeholder="e.g., 50.0" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-warning">AMPOULE VOLUME (mL)</Form.Label>
                                        <Form.Control type="number" step="0.1" name="volume" value={formData.volume || ''} onChange={handleChange} placeholder="e.g., 5.0" />
                                    </Form.Group>
                                </Col>
                            </>
                        )}

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">ASSIGNED MACHINE</Form.Label>
                                <Form.Select name="hardwareId" value={formData.hardwareId} onChange={handleChange} required>
                                    <option value="">Select Hardware...</option>
                                    {hardwareList.map(hw => <option key={hw.hardwareId} value={hw.hardwareId}>{hw.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-warning"><FaLink className="me-1"/>FREE PORT</Form.Label>
                                <Form.Select 
                                    name="hardwarePort" 
                                    value={formData.hardwarePort || ''} 
                                    onChange={handleChange}
                                    disabled={!formData.hardwareId}
                                    className="border-warning"
                                >
                                    <option value="">Choose Port...</option>
                                    {freePorts.map(port => (
                                        <option key={port} value={port}>{port}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">UNIT</Form.Label>
                                <Form.Control type="text" name="unit" value="mL" disabled readOnly style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold', height: '38px' }} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <hr className="my-4 opacity-50" />
                    <h6 className="text-uppercase fw-bold text-primary mb-3"><FaFlask className="me-2"/>Initial Stock Batch</h6>
                    <Row>
                        <Col md={4}><Form.Group className="mb-3"><Form.Label className="small fw-bold">QUANTITY</Form.Label><Form.Control type="number" name="quantity" value={formData.initialStock?.quantity || ''} onChange={handleStockChange} min="1"/></Form.Group></Col>
                        <Col md={8}><Form.Group className="mb-3"><Form.Label className="small fw-bold">SUPPLIER</Form.Label><Form.Control type="text" name="supplier" value={formData.initialStock?.supplier || ''} onChange={handleStockChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">BATCH NUMBER</Form.Label><Form.Control type="text" name="batchNumber" value={formData.initialStock?.batchNumber || ''} onChange={handleStockChange} /></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="small fw-bold">EXPIRY DATE</Form.Label><Form.Control type="date" name="expired" value={formData.initialStock?.expired || ''} onChange={handleStockChange} /></Form.Group></Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={handleClose}>Close</Button>
                <Button className="btn-custom-primary px-5 rounded-pill shadow-sm" onClick={onSave} disabled={!formData.hardwareId || !formData.hardwarePort}>Save Master Item</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddInventoryMasterModal;