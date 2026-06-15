// components/EditInventoryMasterModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaBoxes, FaSlidersH, FaLink, FaTimes, FaSave } from 'react-icons/fa';
import * as hardwareService from '../services/hardwareService';
import * as inventoryService from '../services/inventoryService';

function EditInventoryMasterModal({ show, handleClose, handleSave, item }) {
    const [formData, setFormData] = useState({});
    const [hardwareList, setHardwareList] = useState([]);
    const [inventoryList, setInventoryList] = useState([]);
    const [occupiedPorts, setOccupiedPorts] = useState([]);
    const [error, setError] = useState('');

    // Load available hardware and inventories
    useEffect(() => {
        if (show) {
            setError('');
            Promise.all([
                hardwareService.getAllHardware(),
                inventoryService.getAllInventory()
            ])
            .then(([hwData, invData]) => {
                setHardwareList(hwData.filter(h => h.status && !h.isArchived));
                setInventoryList(invData);
            })
            .catch(() => setError("Failed to sync hardware port configurations."));
        }
    }, [show]);

    // Populate form on mount or item change
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                unit: item.unit || 'mL',
                category: item.category || 'API',
                concentration: item.concentration || '',
                volume: item.volume || '',
                hardwareId: item.hardwareId || '',
                hardwarePort: item.hardwarePort || ''
            });
        }
    }, [item, show]);

    // Calculate occupied ports whenever selected machine changes
    useEffect(() => {
        if (formData.hardwareId && item) {
            const taken = inventoryList
                .filter(inv => 
                    inv.hardwareId === parseInt(formData.hardwareId, 10) && 
                    inv.inventoryId !== item.inventoryId // --- CRITICAL GUARDRAIL: Exclude this item itself so its current port remains selectable!
                )
                .map(inv => inv.hardwarePort);
            setOccupiedPorts(taken);
        } else {
            setOccupiedPorts([]);
        }
    }, [formData.hardwareId, inventoryList, item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        };
        handleSave(dataToSave);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaBoxes className="me-2 text-warning"/> Edit Master Item: {item?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
                <Form>
                    <h6 className="text-uppercase fw-bold text-primary mb-3"><FaSlidersH className="me-2"/>Category & Hardware Mapping</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">ITEM NAME</Form.Label>
                                <Form.Control type="text" name="name" value={formData.name || ''} onChange={handleChange} />
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
                                        <Form.Control type="number" step="0.1" name="concentration" value={formData.concentration || ''} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-warning">AMPOULE VOLUME (mL)</Form.Label>
                                        <Form.Control type="number" step="0.1" name="volume" value={formData.volume || ''} onChange={handleChange} />
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
                </Form>
            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleClose}><FaTimes/> Close</Button>
                <Button className="btn-custom-primary px-5 rounded-pill shadow-sm" onClick={onSave} disabled={!formData.hardwareId || !formData.hardwarePort}><FaSave className="me-2"/> Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditInventoryMasterModal;