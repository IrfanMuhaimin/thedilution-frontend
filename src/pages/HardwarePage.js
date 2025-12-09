//pages/HardwarePage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // 1. Import useMemo
import { Table, Button, Card, Alert, Spinner, Form, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import * as hardwareService from '../services/hardwareService';
import HardwareModal from '../components/HardwareModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function HardwarePage() {
    // STATE SIMPLIFICATION
    const [hardwareList, setHardwareList] = useState([]); // This is our single source of truth
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states remain the same
    const [showHardwareModal, setShowHardwareModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentHardware, setCurrentHardware] = useState(null);
    const [hardwareToDelete, setHardwareToDelete] = useState(null);

    const fetchHardware = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await hardwareService.getAllHardware();
            setHardwareList(data);
        } catch (err) {
            setError('Failed to fetch hardware. You may not have permission to view this data.');
            setHardwareList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHardware();
    }, [fetchHardware]);

    // --- 2. DERIVE THE FILTERED LIST ON THE FLY using useMemo ---
    // This is more efficient and reliable. It only recalculates when its dependencies change.
    const filteredHardwareList = useMemo(() => {
        let result = hardwareList;

        if (searchTerm) {
            result = result.filter(hw =>
                hw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (hw.description && hw.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (statusFilter !== 'All') {
            const isActive = statusFilter === 'Active';
            result = result.filter(hw => hw.status === isActive);
        }

        return result;
    }, [hardwareList, searchTerm, statusFilter]);

    // --- All handler functions remain the same ---
    const handleAdd = () => { setCurrentHardware(null); setShowHardwareModal(true); };
    const handleEdit = (hardware) => { setCurrentHardware(hardware); setShowHardwareModal(true); };
    const handleDelete = (hardware) => { setHardwareToDelete(hardware); setShowDeleteModal(true); };

    const handleSaveHardware = async (hardwareData) => {
        try {
            if (currentHardware && currentHardware.hardwareId) {
                await hardwareService.updateHardware(currentHardware.hardwareId, hardwareData);
            } else {
                await hardwareService.addHardware(hardwareData);
            }
            setShowHardwareModal(false);
            fetchHardware();
        } catch (err) { setError(err.message); }
    };

    const handleConfirmDelete = async () => {
        if (!hardwareToDelete) return;
        try {
            await hardwareService.deleteHardware(hardwareToDelete.hardwareId);
            setShowDeleteModal(false);
            setHardwareToDelete(null);
            fetchHardware();
        } catch (err) { setError(err.message); }
    };

    return (
        <>
            <Card className="shadow-sm border-light-subtle">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
                    <h2 className="mb-0">Hardware Management</h2>
                    <Button className="btn-custom-primary" onClick={handleAdd}>
                        <FaPlus className="me-2" /> Add New Hardware
                    </Button>
                </Card.Header>
                <Card.Body>
                    {/* --- NEW SEARCH & FILTER FORM --- */}
                    <Form className="mb-4">
                        <Row className="align-items-end">
                            <Col md={4}>
                                <Form.Group controlId="hardwareSearch">
                                    <Form.Label>Search by Name or Description</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaSearch /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group controlId="statusFilter">
                                    <Form.Label>Filter by Status</Form.Label>
                                    <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                        <option value="All">All</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" /></div>
                    ) : (
                        <Table striped hover responsive>
                            <thead>
                                <tr className="fw-bold">
                                    <th>ID</th><th>Name</th><th>Description</th><th>Status</th>
                                    <th>Last Maintenance</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* --- MODIFIED: Map over the new filteredHardwareList --- */}
                                {filteredHardwareList.map(hw => (
                                    <tr key={hw.hardwareId}>
                                        <td>{hw.hardwareId}</td>
                                        <td>{hw.name}</td>
                                        <td>{hw.description}</td>
                                        <td>
                                            <Badge bg={hw.status ? 'success' : 'secondary'}>
                                                {hw.status ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>
                                            {hw.lastMaintenanceDate ? format(new Date(hw.lastMaintenanceDate), 'dd/MM/yyyy') : 'N/A'}
                                        </td>
                                        <td>
                                            <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEdit(hw)}><FaEdit /></Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(hw)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <HardwareModal 
                show={showHardwareModal}
                handleClose={() => setShowHardwareModal(false)}
                handleSave={handleSaveHardware}
                hardware={currentHardware}
            />

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={hardwareToDelete?.name}
            />
        </>
    );
}

export default HardwarePage;