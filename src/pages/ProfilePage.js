import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaCamera, FaCheckCircle, FaTimesCircle, FaUserShield, FaEnvelope, FaBuilding, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import * as userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { validatePassword } from '../utils/passwordValidator';
import '../styles/ProfilePage.css';

function ProfilePage() {
    const { updateUserInfo } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        department: '',
        email: '',
        profilePicture: ''
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Visibility Toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password validation logic
    const checks = useMemo(() => validatePassword(password), [password]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getMyProfile();
                setProfileData(data);
                setFormData({
                    username: data.username,
                    department: data.department,
                    email: data.email || '',
                    profilePicture: data.profilePicture || ''
                });
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Handle Image upload and convert to Base64
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                return alert("Image is too large. Please select a file under 2MB.");
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate password if user is trying to change it
        if (password) {
            if (!checks.isValid) {
                setError("New password does not meet security requirements.");
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
        }

        try {
            // Security: Strip out 'username' before sending payload to the API
            const { username, ...updateData } = formData; 
            if (password) updateData.password = password;

            const updatedUser = await userService.updateMyProfile(updateData);
            
            // Update global state immediately
            updateUserInfo({
                profilePicture: updatedUser.profilePicture
            });

            setSuccess("Profile updated successfully!");
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        }
    };

    const Requirement = ({ met, text }) => (
        <div className={`small ${met ? 'text-success' : 'text-danger'} d-flex align-items-center mb-1`}>
            {met ? <FaCheckCircle className="me-2" /> : <FaTimesCircle className="me-2" style={{opacity: 0.6}} />}
            {text}
        </div>
    );

    if (loading) return (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
    );

    return (
        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
            <Card.Header className="bg-white py-3 border-bottom">
                <h2 className="mb-0 fw-bold text-primary">Account Settings</h2>
            </Card.Header>
            <Card.Body className="p-4 p-lg-5">
                <Form onSubmit={handleSubmit}>
                    <Row>
                        {/* Profile Picture Section */}
                        <Col lg={4} className="text-center border-end-lg mb-4 mb-lg-0">
                            <div className="profile-avatar-large mx-auto mb-3 shadow">
                                {formData.profilePicture ? (
                                    <img src={formData.profilePicture} alt="Profile" />
                                ) : (
                                    profileData?.username?.charAt(0).toUpperCase()
                                )}
                                <label className="avatar-edit-badge">
                                    <FaCamera />
                                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                            <h4 className="mt-3 mb-1 fw-bold">{profileData?.username}</h4>
                            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                                <FaUserShield className="me-2" />
                                {profileData?.role}
                            </span>
                            <p className="text-muted small mt-3">Member since {new Date(profileData?.active).toLocaleDateString()}</p>
                        </Col>

                        {/* Info Section */}
                        <Col lg={8} className="ps-lg-5">
                            {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                            {success && <Alert variant="success" className="rounded-3">{success}</Alert>}
                            
                            <h5 className="mb-4 text-secondary text-uppercase small fw-bold letter-spacing-1">General Information</h5>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted"><FaUser className="me-2"/>Username</Form.Label>
                                        {/* --- NEW: UN-EDITABLE USERNAME FIELD --- */}
                                        <Form.Control 
                                            value={formData.username || ''} 
                                            disabled 
                                            readOnly 
                                            style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', fontWeight: 'bold' }} 
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted"><FaBuilding className="me-2"/>Department</Form.Label>
                                        <Form.Control 
                                            value={formData.department} 
                                            onChange={e => setFormData({...formData, department: e.target.value})} 
                                            placeholder="e.g. Cardiology"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted"><FaEnvelope className="me-2"/>Email Address</Form.Label>
                                        <Form.Control 
                                            type="email"
                                            value={formData.email} 
                                            onChange={e => setFormData({...formData, email: e.target.value})} 
                                            placeholder="name@hospital.com"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr className="my-4 opacity-50" />
                            
                            <h5 className="mb-4 text-secondary text-uppercase small fw-bold letter-spacing-1">Security & Password</h5>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">New Password</Form.Label>
                                        <InputGroup>
                                            <Form.Control 
                                                type={showPassword ? "text" : "password"} 
                                                value={password} 
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="border-end-0"
                                            />
                                            <InputGroup.Text onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', background: '#ffffff', borderLeft: 'none' }} className="text-muted border">
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </InputGroup.Text>
                                        </InputGroup>
                                        {password && (
                                            <div className="mt-3 p-3 bg-light rounded-3 border">
                                                <Requirement met={checks.hasLength} text="8+ characters" />
                                                <Requirement met={checks.hasUpper} text="Uppercase letter" />
                                                <Requirement met={checks.hasLower} text="Lowercase letter" />
                                                <Requirement met={checks.hasNumber} text="A number" />
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Confirm New Password</Form.Label>
                                        <InputGroup>
                                            <Form.Control 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                value={confirmPassword} 
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                isInvalid={confirmPassword && password !== confirmPassword}
                                                placeholder="••••••••"
                                                className="border-end-0"
                                            />
                                            <InputGroup.Text onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer', background: '#ffffff', borderLeft: 'none' }} className="text-muted border">
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="text-end mt-4">
                                <Button variant="primary" className="btn-custom-primary px-5 py-2 shadow-sm" type="submit">
                                    Save Changes
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default ProfilePage;