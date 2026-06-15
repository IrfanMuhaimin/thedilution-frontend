import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Card, Alert, Spinner, Form, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaArchive, FaSearch, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import * as hardwareService from '../services/hardwareService';
import HardwareModal from '../components/HardwareModal';
import HardwarePreviewModal from '../components/HardwarePreviewModal'; // NEW
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function HardwarePage() {
    const navigate = useNavigate();
    const [hardwareList, setHardwareList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showHardwareModal, setShowHardwareModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false); // NEW
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    
    const [currentHardware, setCurrentHardware] = useState(null);
    const [selectedForPreview, setSelectedForPreview] = useState(null); // NEW
    const [hardwareToArchive, setHardwareToArchive] = useState(null);
    const [isArchiving, setIsArchiving] = useState(false);

    const fetchHardware = useCallback(async () => {
        try {
            setLoading(true); setError('');
            const data = await hardwareService.getAllHardware();
            setHardwareList(data);
        } catch (err) {
            setError('Failed to fetch hardware. You may not have permission to view this data.');
            setHardwareList([]);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchHardware(); }, [fetchHardware]);

    const filteredHardwareList = useMemo(() => {
        let result = hardwareList;
        if (searchTerm) {
            result = result.filter(hw => hw.name.toLowerCase().includes(searchTerm.toLowerCase()) || (hw.description && hw.description.toLowerCase().includes(searchTerm.toLowerCase())));
        }
        if (statusFilter !== 'All') {
            const isActive = statusFilter === 'Active';
            result = result.filter(hw => hw.status === isActive);
        }
        return result;
    }, [hardwareList, searchTerm, statusFilter]);

    const handleAdd = () => { setCurrentHardware(null); setShowHardwareModal(true); };
    const handleEdit = (hardware) => { setCurrentHardware(hardware); setShowHardwareModal(true); };
    const handleArchiveClick = (hardware) => { setHardwareToArchive(hardware); setShowArchiveModal(true); };
    
    // NEW: Handle diagnostics preview click
    const handlePreviewClick = (hardware) => { setSelectedForPreview(hardware); setShowPreviewModal(true); };

    const handleSaveHardware = async (hardwareData) => {
        try {
            if (currentHardware && currentHardware.hardwareId) await hardwareService.updateHardware(currentHardware.hardwareId, hardwareData);
            else await hardwareService.addHardware(hardwareData);
            setShowHardwareModal(false);
            fetchHardware();
        } catch (err) { setError(err.message); }
    };

    const handleConfirmArchive = async () => {
        if (!hardwareToArchive) return;
        setIsArchiving(true);
        try {
            await hardwareService.deleteHardware(hardwareToArchive.hardwareId);
            setShowArchiveModal(false);
            setHardwareToArchive(null);
            fetchHardware();
        } catch (err) { setError(err.message); }
        finally { setIsArchiving(false); }
    };

    return (
        <>
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3 border-0">
                    <h2 className="mb-0 text-primary fw-bold">Hardware Management</h2>
                    <Button className="btn-custom-primary rounded-pill px-4 shadow-sm" onClick={handleAdd}>
                        <FaPlus className="me-2" /> Add New Hardware
                    </Button>
                </Card.Header>
                <Card.Body className="p-4 bg-light">
                    <Form className="mb-4">
                        <Row className="align-items-end">
                            <Col md={4}>
                                <Form.Group controlId="hardwareSearch">
                                    <Form.Label className="small fw-bold text-muted">SEARCH HARDWARE</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                        <Form.Control type="text" placeholder="Name or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-start-0" />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="statusFilter">
                                    <Form.Label className="small fw-bold text-muted">FILTER BY STATUS</Form.Label>
                                    <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        <option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

                    {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                    
                    {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
                        <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                            <Table hover responsive className="align-middle mb-0">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr><th>ID</th><th>Name</th><th>Description</th><th>Status</th><th>Last Maintenance</th><th className="text-center">Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filteredHardwareList.length > 0 ? filteredHardwareList.map(hw => (
                                        <tr key={hw.hardwareId}>
                                            <td><Badge bg="light" text="dark" className="border">#{hw.hardwareId}</Badge></td>
                                            <td className="entity-name-dark-blue">{hw.name}</td>
                                            <td className="text-muted">{hw.description}</td>
                                            <td><span className={`custom-status-badge ${hw.status ? 'bg-status-active' : 'bg-status-inactive'}`}>{hw.status ? 'Active' : 'Inactive'}</span></td>
                                            <td className="small text-muted">{hw.lastMaintenanceDate ? format(new Date(hw.lastMaintenanceDate), 'dd/MM/yyyy') : 'N/A'}</td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    {/* NEW: PREVIEW WEBGL BUTTON */}
                                                    <button className="btn-table-action" onClick={() => handlePreviewClick(hw)} title="Run WebGL Diagnostics"><FaEye /></button>
                                                    <button className="btn-table-action" onClick={() => handleEdit(hw)} title="Edit Hardware"><FaEdit /></button>
                                                    <button className="btn-table-action" onClick={() => handleArchiveClick(hw)} title="Archive Hardware"><FaArchive /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="6" className="text-center text-muted p-4">No active hardware found.</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {!loading && (
                        <div className="d-flex justify-content-center mt-4">
                            <Button variant="light" className="archive-bottom-btn shadow-sm" onClick={() => navigate('/hardware/archive')}>
                                <FaArchive className="me-2 text-muted" /> <span className="fw-bold text-muted">View Archived Hardware</span>
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <HardwareModal show={showHardwareModal} handleClose={() => setShowHardwareModal(false)} handleSave={handleSaveHardware} hardware={currentHardware} />
            
            {/* NEW: DIAGNOSTICS PREVIEW MODAL */}
            <HardwarePreviewModal show={showPreviewModal} handleClose={() => setShowPreviewModal(false)} hardware={selectedForPreview} />
            
            <DeleteConfirmationModal show={showArchiveModal} handleClose={() => setShowArchiveModal(false)} handleConfirm={handleConfirmArchive} itemName={hardwareToArchive?.name} entityName="Hardware" actionType="Archive" isProcessing={isArchiving} />
        </>
    );
}

export default HardwarePage;