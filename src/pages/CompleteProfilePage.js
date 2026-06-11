import React, { useState, useMemo } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import { validatePassword } from '../utils/passwordValidator';
import { FaUserEdit, FaCamera, FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
// Import the background image
import loginBackground from '../assets/login-background.jpg';

function CompleteProfilePage() {
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({ department: '', email: '', profilePicture: '' });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Visibility Toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState('');

    const checks = useMemo(() => validatePassword(password), [password]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Limit size to 2MB to prevent database payload errors
            if (file.size > 2 * 1024 * 1024) {
                alert("File is too large! Please choose an image under 2MB.");
                e.target.value = null;
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const Requirement = ({ met, text }) => (
        <div className={`small ${met ? 'text-success' : 'text-muted'} d-flex align-items-center mb-1`}>
            {met ? <FaCheckCircle className="me-2"/> : <FaTimesCircle className="me-2" style={{opacity: 0.5}}/>}
            {text}
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!checks.isValid) return setError("Password does not meet requirements.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        try {
            await userService.updateMyProfile({ ...formData, password });
            alert("Profile setup complete! Please log in with your new password.");
            logout(); // Destroys the current temporary session and redirects to login
        } catch (err) { 
            setError(err.message || "An error occurred during profile setup."); 
        }
    };

    return (
        <div style={{
            // Negative margin to counteract the padding from App.js main container
            margin: '-1rem',
            minHeight: 'calc(100vh - 70px)', // Fills the screen below the navbar
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem'
        }}>
            {/* The Dark Blue Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(4, 56, 115, 0.85) 0%, rgba(2, 42, 84, 0.95) 100%)',
                backdropFilter: 'blur(5px)',
                zIndex: 1
            }}></div>

            <Container style={{ zIndex: 2, position: 'relative' }} className="d-flex justify-content-center">
                <Card className="shadow-lg border-0 w-100" style={{ maxWidth: '700px', borderRadius: '20px' }}>
                    <Card.Header className="text-center py-4 text-white border-0" style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', borderRadius: '20px 20px 0 0' }}>
                        <FaUserEdit size={40} className="text-warning mb-2" />
                        <h3>Secure Account Setup</h3>
                        <p className="mb-0 opacity-75">Welcome, {user?.username}. Please finalize your credentials.</p>
                    </Card.Header>
                    <Card.Body className="p-4 p-md-5">
                        {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            {/* Avatar Uploader */}
                            <div className="text-center mb-4">
                                <div className="mx-auto profile-avatar-setup mb-3 shadow-sm">
                                    {formData.profilePicture ? (
                                        <img src={formData.profilePicture} alt="Preview" className="profile-img-preview" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            <FaCamera size={30} className="text-muted" />
                                        </div>
                                    )}
                                </div>
                                <Form.Label className="btn btn-outline-primary btn-sm px-4 rounded-pill cursor-pointer shadow-sm fw-bold">
                                    <FaCamera className="me-2" /> {formData.profilePicture ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                                </Form.Label>
                            </div>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">DEPARTMENT</Form.Label>
                                        <Form.Control required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="shadow-sm" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">EMAIL ADDRESS</Form.Label>
                                        <Form.Control required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="shadow-sm" />
                                    </Form.Group>
                                </Col>
                                
                                {/* New Password with Eye Icon */}
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">NEW PASSWORD</Form.Label>
                                        <div className="input-group">
                                            <Form.Control 
                                                required 
                                                type={showPassword ? "text" : "password"} 
                                                value={password} 
                                                onChange={e => setPassword(e.target.value)} 
                                                className="shadow-sm border-end-0" 
                                            />
                                            <span 
                                                onClick={() => setShowPassword(!showPassword)} 
                                                style={{ cursor: 'pointer', background: '#ffffff', borderLeft: 'none' }} 
                                                className="input-group-text text-muted border"
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                        <div className="mt-2 p-3 bg-light rounded-3 border shadow-sm" style={{fontSize: '0.8rem'}}>
                                            <Requirement met={checks.hasLength} text="At least 8 characters" />
                                            <Requirement met={checks.hasUpper} text="Uppercase letter (A-Z)" />
                                            <Requirement met={checks.hasLower} text="Lowercase letter (a-z)" />
                                            <Requirement met={checks.hasNumber} text="A number (0-9)" />
                                        </div>
                                    </Form.Group>
                                </Col>
                                
                                {/* Confirm Password with Eye Icon */}
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">CONFIRM PASSWORD</Form.Label>
                                        <div className="input-group">
                                            <Form.Control 
                                                required 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                value={confirmPassword} 
                                                onChange={e => setConfirmPassword(e.target.value)} 
                                                isInvalid={confirmPassword && password !== confirmPassword} 
                                                className="shadow-sm border-end-0" 
                                            />
                                            <span 
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                                style={{ cursor: 'pointer', background: '#ffffff', borderLeft: 'none' }} 
                                                className="input-group-text text-muted border"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </span>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Button className="w-100 btn-custom-primary py-3 mt-4 rounded-pill fw-bold shadow" type="submit" disabled={!checks.isValid || password !== confirmPassword}>
                                Complete Setup & Login
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default CompleteProfilePage;