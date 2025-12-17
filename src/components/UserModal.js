import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { FaUser, FaLock, FaUserTag, FaBuilding, FaExclamationTriangle, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/UserManagement.css';

function UserModal({ show, handleClose, handleSave, user }) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const isEditMode = !!user?.userId;

    useEffect(() => {
        setError(''); 
        if (user) {
            setFormData(user);
        } else {
            setFormData({
                username: '',
                password: '',
                role: 'Pharmacist',
                department: '',
                status: true,
            });
        }
    }, [user, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.username || !formData.department) {
            setError('Username and Department are required fields.');
            return false;
        }
        if (!isEditMode && !formData.password) {
            setError('Password is required for new users.');
            return false;
        }
        setError('');
        return true;
    };

    const onSave = () => {
        if (!validateForm()) {
            return;
        }
        const dataToSave = { ...formData };
        if (dataToSave.active) {
            dataToSave.active = new Date(dataToSave.active).toISOString();
        } else {
            dataToSave.active = new Date().toISOString();
        }
        handleSave(dataToSave);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" className="um-modal" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isEditMode ? (
                        <>
                            <FaUser className="me-2" style={{ opacity: 0.8 }} />
                            Edit User
                        </>
                    ) : (
                        <>
                            <FaUser className="me-2" style={{ opacity: 0.8 }} />
                            Add New User
                        </>
                    )}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="d-flex align-items-center gap-2" style={{ 
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                    }}>
                        <FaExclamationTriangle />
                        {error}
                    </Alert>
                )}
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    <FaUser className="me-2" style={{ opacity: 0.5 }} />
                                    Username
                                </Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="username" 
                                    placeholder="Enter username"
                                    required 
                                    value={formData.username || ''} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                        {!isEditMode && (
                            <Col md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        <FaLock className="me-2" style={{ opacity: 0.5 }} />
                                        Password
                                    </Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        name="password" 
                                        placeholder="Enter password"
                                        required 
                                        value={formData.password || ''} 
                                        onChange={handleChange} 
                                    />
                                </Form.Group>
                            </Col>
                        )}
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    <FaUserTag className="me-2" style={{ opacity: 0.5 }} />
                                    Role
                                </Form.Label>
                                <Form.Select 
                                    name="role" 
                                    value={formData.role || ''} 
                                    onChange={handleChange}
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Pharmacist">Pharmacist</option>
                                    <option value="Doctor">Doctor</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    <FaBuilding className="me-2" style={{ opacity: 0.5 }} />
                                    Department
                                </Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="department" 
                                    placeholder="Enter department"
                                    required 
                                    value={formData.department || ''} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem 1.25rem',
                                    background: formData.status 
                                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%)'
                                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%)',
                                    borderRadius: '12px',
                                    border: formData.status 
                                        ? '1px solid rgba(16, 185, 129, 0.2)'
                                        : '1px solid rgba(239, 68, 68, 0.2)',
                                    transition: 'all 0.25s ease'
                                }}>
                                    <Form.Check
                                        type="switch"
                                        id="status-switch"
                                        name="status"
                                        checked={formData.status || false}
                                        onChange={handleChange}
                                        style={{ 
                                            transform: 'scale(1.2)', 
                                            marginRight: '0.5rem' 
                                        }}
                                    />
                                    <div>
                                        <div style={{ 
                                            fontWeight: 600, 
                                            color: formData.status ? '#10b981' : '#64748b',
                                            fontSize: '0.9375rem'
                                        }}>
                                            {formData.status ? 'User is Active' : 'User is Inactive'}
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.8125rem', 
                                            color: '#94a3b8',
                                            marginTop: '0.125rem'
                                        }}>
                                            {formData.status 
                                                ? 'This user can access the system'
                                                : 'This user cannot access the system'}
                                        </div>
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="um-btn-cancel" onClick={handleClose}>
                    <FaTimes className="me-2" />
                    Cancel
                </Button>
                <Button className="um-btn-save" onClick={onSave}>
                    <FaSave className="me-2" />
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UserModal;