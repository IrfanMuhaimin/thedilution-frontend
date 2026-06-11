import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { 
    FaUser, FaLock, FaUserTag, FaBuilding, 
    FaExclamationTriangle, FaSave, FaTimes, FaCheckCircle, FaTimesCircle, FaEyeSlash, FaEye 
} from 'react-icons/fa';
import { validatePassword } from '../utils/passwordValidator';
import '../styles/UserManagement.css';

function UserModal({ show, handleClose, handleSave, user }) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isEditMode = !!user?.userId;

    // Password validation logic
    const passwordChecks = useMemo(() => validatePassword(formData.password || ''), [formData.password]);

    // 1. SYNC LOGIC: Convert string 'active' to boolean for the switch
    useEffect(() => {
        setError(''); 
        if (user) {
            setFormData({
                ...user,
                status: user.status === 'active', // 'active' becomes true, others become false
                password: '' // Don't pre-fill password in edit mode
            });
        } else {
            setFormData({
                username: '',
                password: '',
                role: 'Pharmacist',
                department: '',
                status: true, // Default new user to active
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
            setError('Username and Department are required.');
            return false;
        }
        
        // Only validate password requirements for NEW users, 
        // or if an Admin is explicitly typing a NEW password during edit.
        if (!isEditMode || formData.password) {
            if (!passwordChecks.isValid) {
                setError('Password does not meet security requirements.');
                return false;
            }
        }
        
        setError('');
        return true;
    };

    const onSave = () => {
        if (!validateForm()) return;

        // 2. TRANSLATE BACK: Convert boolean back to string for MySQL
        const dataToSave = { 
            ...formData,
            status: formData.status ? 'active' : 'inactive'
        };

        // Remove password field if it's empty during an edit
        if (isEditMode && !dataToSave.password) {
            delete dataToSave.password;
        }

        handleSave(dataToSave);
    };

    const Requirement = ({ met, text }) => (
        <div className={`small ${met ? 'text-success' : 'text-muted'} d-flex align-items-center mb-1`}>
            {met ? <FaCheckCircle className="me-2"/> : <FaTimesCircle className="me-2" style={{opacity: 0.5}}/>}
            {text}
        </div>
    );

    return (
        <Modal show={show} onHide={handleClose} size="lg" className="um-modal" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaUser className="me-2" style={{ opacity: 0.8 }} />
                    {isEditMode ? `Edit User: ${user.username}` : 'Add New User'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="d-flex align-items-center gap-2 rounded-3 border-0 shadow-sm">
                        <FaExclamationTriangle />
                        {error}
                    </Alert>
                )}
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase"><FaUser className="me-2" />Username</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="username" 
                                    placeholder="Enter username"
                                    value={formData.username || ''} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase"><FaUserTag className="me-2" />Role</Form.Label>
                                <Form.Select name="role" value={formData.role || ''} onChange={handleChange}>
                                    <option value="Admin">Admin</option>
                                    <option value="Pharmacist">Pharmacist</option>
                                    <option value="Doctor">Doctor</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase"><FaBuilding className="me-2" />Department</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="department" 
                                    placeholder="e.g. Pharmacy"
                                    value={formData.department || ''} 
                                    onChange={handleChange} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase">
                                    <FaLock className="me-2" /> 
                                    {isEditMode ? 'New Password (Optional)' : 'Initial Password'}
                                </Form.Label>
                                <InputGroup>
                                    <Form.Control 
                                        type={showPassword ? "text" : "password"} // State-driven type
                                        name="password" 
                                        placeholder={isEditMode ? "Leave blank to keep current" : "Enter password"}
                                        value={formData.password || ''} 
                                        onChange={handleChange} 
                                        className="border-end-0"
                                    />
                                    <InputGroup.Text 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        style={{ cursor: 'pointer', background: '#ffffff', borderLeft: 'none' }} 
                                        className="text-muted"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </InputGroup.Text>
                                </InputGroup>
                                {(formData.password || !isEditMode) && (
                                    <div className="mt-2 p-2 bg-light rounded border" style={{ fontSize: '0.75rem' }}>
                                        <Requirement met={passwordChecks.hasLength} text="8+ Characters" />
                                        <Requirement met={passwordChecks.hasUpper} text="Uppercase & Lowercase" />
                                        <Requirement met={passwordChecks.hasNumber} text="At least one number" />
                                    </div>
                                )}
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <div className={`p-3 rounded-3 border transition-all ${formData.status ? 'bg-success-subtle border-success' : 'bg-light border-secondary'}`}>
                                    <Form.Check
                                        type="switch"
                                        id="status-switch"
                                        name="status"
                                        label={formData.status ? "User Account is ACTIVE" : "User Account is INACTIVE"}
                                        checked={formData.status || false}
                                        onChange={handleChange}
                                        className="fw-bold"
                                    />
                                    <p className="small text-muted mb-0 ms-4">
                                        {formData.status 
                                            ? "The user will be able to log in to the system immediately." 
                                            : "The user's access will be revoked until reactivated."}
                                    </p>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="outline-secondary" className="px-4 rounded-pill" onClick={handleClose}>
                    <FaTimes className="me-2" /> Cancel
                </Button>
                <Button className="btn-custom-primary px-4 rounded-pill" onClick={onSave}>
                    <FaSave className="me-2" /> {isEditMode ? 'Update User' : 'Create User'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UserModal;