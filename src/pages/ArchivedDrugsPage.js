import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaArrowLeft, FaUndo, FaArchive, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as drugService from '../services/drugService';
import '../styles/DrugManagement.css';

function ArchivedDrugsPage() {
    const navigate = useNavigate();
    const [formulas, setFormulas] = useState([]);
    const [dilutions, setDilutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadArchived = async () => {
        setLoading(true); setError('');
        try {
            const [fData, dData] = await Promise.all([drugService.getArchivedFormulas(), drugService.getArchivedDilutions()]);
            setFormulas(fData);
            setDilutions(dData);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadArchived(); }, []);

    // Handlers
    const handleRestoreFormula = async (id) => { await drugService.restoreFormula(id); loadArchived(); };
    const handleRestoreDilution = async (id) => { await drugService.restoreDilution(id); loadArchived(); };
    
    const handlePermanentDeleteFormula = async (id, name) => {
        if (!window.confirm(`Permanently delete formula "${name}"?`)) return;
        try { await drugService.permanentDeleteFormula(id); loadArchived(); } 
        catch (err) { setError(err.message); }
    };
    const handlePermanentDeleteDilution = async (id, name) => {
        if (!window.confirm(`Permanently delete dilution "${name}"?`)) return;
        try { await drugService.permanentDeleteDilution(id); loadArchived(); } 
        catch (err) { setError(err.message); }
    };

    return (
        <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center border-0">
                <h3 className="mb-0 text-secondary"><FaArchive className="me-2"/>Archived Drugs</h3>
                <Button variant="outline-secondary" className="rounded-pill" onClick={() => navigate('/drugs')}>
                    <FaArrowLeft className="me-2"/> Back to Workspace
                </Button>
            </Card.Header>
            <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? <div className="text-center p-5"><Spinner animation="border"/></div> : (
                    <Tabs defaultActiveKey="formulas" className="drug-management-tabs mb-4">
                        <Tab eventKey="formulas" title="Archived Formulas">
                            <Table hover responsive className="align-middle border mt-3">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr><th>ID</th><th>Formula Name</th><th className="text-center">Action</th></tr>
                                </thead>
                                <tbody>
                                    {formulas.map(f => (
                                        <tr key={f.formulaId}>
                                            <td><Badge bg="light" text="dark" className="border">#{f.formulaId}</Badge></td>
                                            <td className="fw-bold text-muted">{f.name}</td>
                                            <td className="text-center">
                                                <Button variant="outline-success" size="sm" className="rounded-pill px-3 me-2" onClick={() => handleRestoreFormula(f.formulaId)}><FaUndo/> Restore</Button>
                                                <Button variant="danger" size="sm" className="rounded-pill px-3" onClick={() => handlePermanentDeleteFormula(f.formulaId, f.name)}><FaTrash/> Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {formulas.length === 0 && <tr><td colSpan="3" className="text-center text-muted p-4">No archived formulas.</td></tr>}
                                </tbody>
                            </Table>
                        </Tab>
                        <Tab eventKey="dilutions" title="Archived Dilutions">
                            <Table hover responsive className="align-middle border mt-3">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr><th>ID</th><th>Dilution Name</th><th className="text-center">Action</th></tr>
                                </thead>
                                <tbody>
                                    {dilutions.map(d => (
                                        <tr key={d.dilutionId}>
                                            <td><Badge bg="light" text="dark" className="border">#{d.dilutionId}</Badge></td>
                                            <td className="fw-bold text-muted">{d.name}</td>
                                            <td className="text-center">
                                                <Button variant="outline-success" size="sm" className="rounded-pill px-3 me-2" onClick={() => handleRestoreDilution(d.dilutionId)}><FaUndo/> Restore</Button>
                                                <Button variant="danger" size="sm" className="rounded-pill px-3" onClick={() => handlePermanentDeleteDilution(d.dilutionId, d.name)}><FaTrash/> Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {dilutions.length === 0 && <tr><td colSpan="3" className="text-center text-muted p-4">No archived dilutions.</td></tr>}
                                </tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                )}
            </Card.Body>
        </Card>
    );
}

export default ArchivedDrugsPage;