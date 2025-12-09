import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Spinner, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import * as userService from '../services/userService';
import UserModal from '../components/UserModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function UserManagementPage() {
    // State for the full user list
    const [users, setUsers] = useState([]);
    
    // State for filtering & searching
    const [roleFilter, setRoleFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // --- LOGIC REORDERED: Search is now applied BEFORE the role filter ---
    useEffect(() => {
        let result = users;

        // 1. Apply search term filter first
        if (searchTerm) {
            result = result.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Apply role filter on the result of the search
        if (roleFilter !== 'All') {
            result = result.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(result);
    }, [users, roleFilter, searchTerm]);

    // --- All handler functions remain the same ---
    const handleAdd = () => { setCurrentUser(null); setShowUserModal(true); };
    const handleEdit = (user) => { setCurrentUser(user); setShowUserModal(true); };
    const handleDelete = (user) => { setUserToDelete(user); setShowDeleteModal(true); };

    const handleSaveUser = async (userData) => {
        try {
            if (currentUser && currentUser.userId) {
                await userService.updateUser(currentUser.userId, userData);
            } else {
                await userService.addUser(userData);
            }
            setShowUserModal(false);
            fetchUsers();
        } catch (err) { alert(err.message); } // Use alert for modal errors
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await userService.deleteUser(userToDelete.userId);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) { setError(err.message); }
    };

    return (
        <>
            <Card className="shadow-sm border-light-subtle">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
                    <h2 className="mb-0">User Management</h2>
                    <Button className="btn-custom-primary" onClick={handleAdd}>
                        <FaPlus className="me-2" /> Add New User
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Form className="mb-4">
                        <Row className="align-items-end">
                            <Col md={4}>
                                <Form.Group controlId="userSearch">
                                    <Form.Label>Search by Name or Department</Form.Label>
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
                                <Form.Group controlId="roleFilter">
                                    <Form.Label>Filter by Role</Form.Label>
                                    <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                        <option value="All">All Roles</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Pharmacist">Pharmacist</option>
                                        <option value="Doctor">Doctor</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading ? ( <div className="text-center py-5"><Spinner animation="border" /></div> ) : (
                        <Table striped hover responsive>
                           <thead>
                                <tr className="fw-bold">
                                    <th>ID</th><th>Username</th><th>Role</th><th>Department</th>
                                    <th>Status</th><th>Date Activated</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.userId}>
                                        <td>{user.userId}</td>
                                        <td>{user.username}</td>
                                        <td>{user.role}</td>
                                        <td>{user.department}</td>
                                        <td>{user.status ? 'Active' : 'Inactive'}</td>
                                        <td>{user.active ? format(new Date(user.active), 'dd/MM/yyyy') : 'N/A'}</td>
                                        <td>
                                            <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEdit(user)}><FaEdit /></Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(user)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <UserModal 
                show={showUserModal}
                handleClose={() => setShowUserModal(false)}
                handleSave={handleSaveUser}
                user={currentUser}
            />

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={userToDelete?.username}
            />
        </>
    );
}

export default UserManagementPage;