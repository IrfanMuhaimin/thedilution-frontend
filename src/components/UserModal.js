import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

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
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit User' : 'Add New User'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" required value={formData.username || ''} onChange={handleChange} /></Form.Group></Col>
                        {!isEditMode && (<Col md={6}><Form.Group className="mb-3"><Form.Label>Password</Form.Label><Form.Control type="password" name="password" required value={formData.password || ''} onChange={handleChange} /></Form.Group></Col>)}
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Role</Form.Label><Form.Select name="role" value={formData.role || ''} onChange={handleChange}><option>Admin</option><option>Pharmacist</option><option>Doctor</option></Form.Select></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label>Department</Form.Label><Form.Control type="text" name="department" required value={formData.department || ''} onChange={handleChange} /></Form.Group></Col>
                        <Col md={6} className="d-flex align-items-center">
                            {/* --- STYLING CHANGE: Added the custom wrapper class --- */}
                             <Form.Group className="mb-3 form-switch-custom">
                                <Form.Check
                                    type="switch"
                                    label="User is Active"
                                    name="status"
                                    checked={formData.status || false}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {/* --- STYLING CHANGE: Using your .btn-custom-secondary class for "Close" --- */}
                <Button className="btn-custom-secondary" onClick={handleClose}>
                    Close
                </Button>
                {/* --- STYLING CHANGE: Using your .btn-custom-primary class for "Save Changes" --- */}
                <Button className="btn-custom-primary" onClick={onSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UserModal;