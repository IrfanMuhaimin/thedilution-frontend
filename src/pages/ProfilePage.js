import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import * as userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import './ProfilePage.css';

function ProfilePage() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const data = await userService.getMyProfile();
            setProfileData(data);
            // Initialize form with editable fields
            setFormData({
                username: data.username,
                department: data.department,
                biometricHash: data.biometricHash || ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        const updateData = { ...formData };
        if (passwordData.newPassword) {
            updateData.password = passwordData.newPassword;
        }

        try {
            await userService.updateMyProfile(updateData);
            setSuccess('Profile updated successfully!');
            setPasswordData({ newPassword: '', confirmPassword: '' }); // Clear password fields
            // Optionally, refresh profile data
            fetchProfile();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="text-center py-5"><Spinner animation="border" /></div>;
    }

    return (
        <Card className="shadow-sm border-light-subtle">
            <Card.Header className="bg-white py-3"><h2 className="mb-0">My Profile</h2></Card.Header>
            <Card.Body>
                <Row>
                    <Col md={4} className="text-center mb-4 mb-md-0">
                        <div className="profile-avatar mx-auto">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="mt-3">{profileData?.username}</h4>
                        <p className="text-muted">{profileData?.role}</p>
                    </Col>
                    <Col md={8}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Username</Form.Label><Form.Control type="text" name="username" value={formData.username || ''} onChange={handleChange} /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Department</Form.Label><Form.Control type="text" name="department" value={formData.department || ''} onChange={handleChange} /></Form.Group></Col>
                                <Col md={12}><Form.Group className="mb-3"><Form.Label>Biometric Hash</Form.Label><Form.Control as="textarea" rows={2} name="biometricHash" value={formData.biometricHash || ''} onChange={handleChange} /></Form.Group></Col>
                                <hr className="my-3" />
                                <Col md={6}><Form.Group className="mb-3"><Form.Label>New Password</Form.Label><Form.Control type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Leave blank to keep current" /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Confirm New Password</Form.Label><Form.Control type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} /></Form.Group></Col>
                                <hr className="my-3" />
                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Status</Form.Label><Form.Control type="text" value={profileData?.status ? 'Active' : 'Inactive'} readOnly disabled /></Form.Group></Col>
                                <Col md={6}><Form.Group className="mb-3"><Form.Label>Date Activated</Form.Label><Form.Control type="text" value={profileData?.active ? format(new Date(profileData.active), 'dd/MM/yyyy') : 'N/A'} readOnly disabled /></Form.Group></Col>
                            </Row>
                            <div className="text-end">
                                <Button className="btn-custom-primary" type="submit">Save Changes</Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}

export default ProfilePage;