import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaUndo, FaArchive, FaUserShield, FaUserMd, FaUserCog, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as userService from '../services/userService';

function ArchivedUsersPage() {
    const navigate = useNavigate();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadArchived = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await userService.getArchivedUsers();
            setList(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadArchived(); }, []);

    const handleRestore = async (id) => {
        try {
            await userService.restoreUser(id);
            loadArchived(); // Refresh list to remove restored user
        } catch (err) { setError(err.message); }
    };

    // --- NEW: PERMANENT DELETE HANDLER ---
    const handlePermanentDelete = async (id, username) => {
        const isConfirmed = window.confirm(
            `CRITICAL WARNING:\n\nAre you sure you want to permanently delete "${username}"?\nThis action will erase the user from the database and cannot be undone.`
        );
        
        if (!isConfirmed) return;

        try {
            setLoading(true);
            await userService.permanentDeleteUser(id);
            loadArchived(); // Refresh list to remove deleted user
        } catch (err) { 
            setError("Cannot delete this user. They are likely tied to existing Jobcards or Reports. " + err.message); 
            setLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return <FaUserShield className="me-1"/>;
            case 'doctor': return <FaUserMd className="me-1"/>;
            default: return <FaUserCog className="me-1"/>;
        }
    };

    return (
        <Card className="shadow-sm border-0 rounded-4">
            <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center border-0">
                <h3 className="mb-0 text-secondary"><FaArchive className="me-2"/>Archived Users</h3>
                <Button variant="outline-secondary" className="rounded-pill" onClick={() => navigate('/users')}>
                    <FaArrowLeft className="me-2"/> Back to Active Users
                </Button>
            </Card.Header>
            <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? <div className="text-center p-5"><Spinner animation="border"/></div> : (
                    <Table hover responsive className="align-middle border">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length > 0 ? list.map(item => (
                                <tr key={item.userId}>
                                    <td><Badge bg="light" text="dark" className="border">#{item.userId}</Badge></td>
                                    <td className="fw-bold text-muted">{item.username}</td>
                                    <td className="text-muted">{getRoleIcon(item.role)} {item.role}</td>
                                    <td className="text-muted">{item.department}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="outline-success" size="sm" className="rounded-pill px-3 shadow-sm" onClick={() => handleRestore(item.userId)}>
                                                <FaUndo className="me-1"/> Restore
                                            </Button>
                                            
                                            {/* NEW: PERMANENT DELETE BUTTON */}
                                            <Button variant="danger" size="sm" className="rounded-pill px-3 shadow-sm" onClick={() => handlePermanentDelete(item.userId, item.username)}>
                                                <FaTrash className="me-1"/> Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center text-muted p-4">No archived users found.</td></tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>
    );
}

export default ArchivedUsersPage;