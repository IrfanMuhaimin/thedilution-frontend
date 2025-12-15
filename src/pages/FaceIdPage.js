import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { FaTrash, FaUserPlus } from 'react-icons/fa';
import * as faceRecognitionService from '../services/faceRecognitionService';
import '../styles/FaceIdPage.css'; // We will create this new CSS file

function FaceIdPage() {
    // State for the registration form
    const [regName, setRegName] = useState('');
    const [regStatus, setRegStatus] = useState({ message: 'System Ready', type: 'info' });
    const [isRegistering, setIsRegistering] = useState(false);

    // State for the list of registered users
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // State for the video feed
    const [videoUrl, setVideoUrl] = useState('');
    const [isConnecting, setIsConnecting] = useState(true);

    // Fetches the list of registered users from the Jetson
    const loadUserList = useCallback(async () => {
        setLoadingUsers(true);
        try {
            const data = await faceRecognitionService.getRegisteredUsers();
            setUsers(data.users);
        } catch (error) {
            setRegStatus({ message: error.message, type: 'danger' });
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    // This effect runs once when the component mounts to initialize everything
    useEffect(() => {
        const initializeRegistration = async () => {
            try {
                // Tell the Jetson to switch to registration mode
                await faceRecognitionService.startRegistrationMode();
                // Load the video feed URL after a short delay
                setTimeout(() => {
                    setVideoUrl(faceRecognitionService.getVideoFeedUrl());
                    setIsConnecting(false);
                }, 500);
                // Fetch the initial list of users
                loadUserList();
            } catch (error) {
                setRegStatus({ message: 'Could not connect to the Face ID module. Please ensure you are on the correct network.', type: 'danger' });
                setIsConnecting(false);
            }
        };
        initializeRegistration();
    }, [loadUserList]);

    const handleRegisterFace = async () => {
        if (!regName) {
            setRegStatus({ message: 'Please enter a name before registering.', type: 'warning' });
            return;
        }
        setIsRegistering(true);
        setRegStatus({ message: 'Capturing face... Please look at the camera.', type: 'info' });
        try {
            const data = await faceRecognitionService.registerFace(regName);
            if (data.status === 'success') {
                setRegStatus({ message: `✅ ${data.message}`, type: 'success' });
                setRegName(''); // Clear input on success
                loadUserList(); // Refresh the user list
            } else {
                setRegStatus({ message: `❌ ${data.message}`, type: 'danger' });
            }
        } catch (error) {
            setRegStatus({ message: 'Error connecting to the Jetson module.', type: 'danger' });
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDeleteUser = async (name) => {
        if (!window.confirm(`Are you sure you want to delete the Face ID for ${name}?`)) return;
        try {
            const data = await faceRecognitionService.deleteUser(name);
            if (data.status === 'success') {
                alert(`Successfully deleted ${name}.`);
                loadUserList(); // Refresh the list after deleting
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert('Error connecting to the Jetson module for deletion.');
        }
    };

    return (
        <Row>
            {/* Left Column: Registration Panel */}
            <Col lg={7} className="mb-4">
                <Card className="shadow-sm h-100">
                    <Card.Header><h3 className="mb-0">Register New Face ID</h3></Card.Header>
                    <Card.Body className="text-center d-flex flex-column">
                        <div className="reg-video-frame">
                            {isConnecting ? (
                                <div className="video-placeholder"><Spinner animation="border" /><p className="mt-2 mb-0">Connecting to Camera...</p></div>
                            ) : videoUrl ? (
                                <iframe src={videoUrl} title="Registration Feed" scrolling="no"></iframe>
                            ) : (
                                <div className="video-placeholder"><Alert variant="danger">Could not load video feed.</Alert></div>
                            )}
                        </div>
                        <Form.Group as={Row} className="mt-3 align-items-center justify-content-center">
                            <Col sm="8">
                                <Form.Control type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Enter Full Name" disabled={isRegistering} />
                            </Col>
                            <Col sm="4" className="text-start mt-2 mt-sm-0">
                                <Button className="btn-custom-primary w-100" onClick={handleRegisterFace} disabled={isRegistering || isConnecting}>
                                    {isRegistering ? <Spinner as="span" animation="border" size="sm" /> : <FaUserPlus />}
                                    <span className="ms-2">{isRegistering ? 'Registering...' : 'Register'}</span>
                                </Button>
                            </Col>
                        </Form.Group>
                        {regStatus.message && <Alert variant={regStatus.type} className="mt-3 mb-0">{regStatus.message}</Alert>}
                    </Card.Body>
                </Card>
            </Col>

            {/* Right Column: Registered Users List */}
            <Col lg={5}>
                <Card className="shadow-sm">
                    <Card.Header><h3 className="mb-0">Registered Users</h3></Card.Header>
                    <Card.Body>
                        {loadingUsers ? (
                            <div className="text-center"><Spinner animation="border" /></div>
                        ) : (
                            <ListGroup variant="flush">
                                {users.length > 0 ? users.map(user => (
                                    <ListGroup.Item key={user} className="d-flex justify-content-between align-items-center">
                                        <span>👤 <strong>{user}</strong></span>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user)} title={`Delete ${user}`}>
                                            <FaTrash />
                                        </Button>
                                    </ListGroup.Item>
                                )) : <p className="text-muted text-center m-3">No users have been registered yet.</p>}
                            </ListGroup>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default FaceIdPage;