import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaUndo, FaArchive, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as jobcardService from '../services/jobcardService';

function ArchivedJobcardsPage() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadArchived = async () => {
        setLoading(true);
        try {
            const data = await jobcardService.getArchivedJobcards();
            setList(data);
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    useEffect(() => { loadArchived(); }, []);

    const handleRestore = async (id) => {
        try {
            await jobcardService.updateJobcard(id, { isArchived: false });
            loadArchived();
        } catch (err) { setError(err.message); }
    };

    const handlePermanentDelete = async (id) => {
        const isConfirmed = window.confirm(
            "CRITICAL WARNING:\n\nAre you sure you want to permanently delete this Jobcard?\nThis action will erase the prescription, consumption logs, and notifications. It cannot be undone."
        );
        
        if (!isConfirmed) return;

        try {
            setLoading(true);
            await jobcardService.permanentDeleteJobcard(id);
            loadArchived();
        } catch (err) { 
            setError("Cannot delete this jobcard. " + err.message); 
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center border-0">
                <h3 className="mb-0 text-secondary"><FaArchive className="me-2"/>Archived Jobcards</h3>
                <Button variant="outline-secondary" className="rounded-pill" onClick={() => navigate('/jobcards')}>
                    <FaArrowLeft className="me-2"/> Back to Workspace
                </Button>
            </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? <div className="text-center p-5"><Spinner animation="border"/></div> : (
                    <Table hover responsive className="align-middle border">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th>ID</th>
                                <th>Dilution</th>
                                <th>Requester</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? list.map(item => (
                                <tr key={item.jobcardId}>
                                    <td><Badge bg="light" text="dark" className="border">#{item.jobcardId}</Badge></td>
                                    <td className="fw-bold">{item.Dilution?.name}</td>
                                    <td>{item.requester?.username}</td>
                                    <td><Badge bg="secondary">{item.status}</Badge></td>
                                    <td className="text-center">
                                        <Button variant="outline-success" size="sm" className="me-2 rounded-pill" onClick={() => handleRestore(item.jobcardId)}>
                                            <FaUndo className="me-1"/> Restore
                                        </Button>
                                        <Button variant="danger" size="sm" className="rounded-pill" onClick={() => handlePermanentDelete(item.jobcardId)}>
                                            <FaTrash className="me-1"/> Delete
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center text-muted p-4">The archive is currently empty.</td></tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
}

export default ArchivedJobcardsPage;