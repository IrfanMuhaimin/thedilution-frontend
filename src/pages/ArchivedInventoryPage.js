import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaUndo, FaArchive, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as inventoryService from '../services/inventoryService';

function ArchivedInventoryPage() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadArchived = async () => {
        setLoading(true); setError('');
        try { setList(await inventoryService.getArchivedInventory()); } 
        catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadArchived(); }, []);

    const handleRestore = async (id) => {
        try { await inventoryService.restoreInventoryMaster(id); loadArchived(); } 
        catch (err) { setError(err.message); }
    };

    const handlePermanentDelete = async (id, name) => {
        if (!window.confirm(`CRITICAL WARNING: Permanently delete inventory item "${name}" and ALL its stock batches?`)) return;
        try {
            setLoading(true);
            await inventoryService.permanentDeleteInventoryMaster(id);
            loadArchived();
        } catch (err) { setError("Cannot delete. It may be tied to existing logs. " + err.message); setLoading(false); }
    };

    return (
        <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center border-0">
                <h3 className="mb-0 text-secondary"><FaArchive className="me-2"/>Archived Inventory</h3>
                <Button variant="outline-secondary" className="rounded-pill" onClick={() => navigate('/inventory')}>
                    <FaArrowLeft className="me-2"/> Back to Workspace
                </Button>
            </Card.Header>
            <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? <div className="text-center p-5"><Spinner animation="border"/></div> : (
                    <Table hover responsive className="align-middle border">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr><th>ID</th><th>Name</th><th>Hardware Port</th><th className="text-center">Action</th></tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? list.map(item => (
                                <tr key={item.inventoryId}>
                                    <td><Badge bg="light" text="dark" className="border">#{item.inventoryId}</Badge></td>
                                    <td className="fw-bold text-muted">{item.name}</td>
                                    <td className="text-muted">{item.Hardware?.name} (Port {item.hardwarePort})</td>
                                    <td className="text-center">
                                        <Button variant="outline-success" size="sm" className="rounded-pill px-3 me-2" onClick={() => handleRestore(item.inventoryId)}>
                                            <FaUndo className="me-1"/> Restore
                                        </Button>
                                        <Button variant="danger" size="sm" className="rounded-pill px-3" onClick={() => handlePermanentDelete(item.inventoryId, item.name)}>
                                            <FaTrash className="me-1"/> Delete
                                        </Button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center text-muted p-4">Archive is empty.</td></tr>}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
}

export default ArchivedInventoryPage;