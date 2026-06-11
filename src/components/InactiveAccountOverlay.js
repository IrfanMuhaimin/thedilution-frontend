import React from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { FaUserSlash, FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
// Import the same background image used in Login
import loginBackground from '../assets/inactive-background.jpg';

function InactiveAccountOverlay() {
    const { logout } = useAuth();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* The same dark blue gradient overlay as the Login page */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(4, 56, 115, 0.85) 0%, rgba(2, 42, 84, 0.95) 100%)',
                backdropFilter: 'blur(5px)',
                zIndex: 1
            }}></div>

            <Container style={{ zIndex: 2, position: 'relative' }}>
                <Card className="mx-auto text-center shadow-lg border-0" style={{ 
                    maxWidth: '500px', 
                    borderRadius: '25px', 
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.98)'
                }}>
                    <Card.Header style={{ 
                        background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', 
                        height: '120px', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: 'none'
                    }}>
                        <FaUserSlash size={40} color="white" className="mb-2" />
                        <h5 className="text-white fw-bold mb-0" style={{ letterSpacing: '1px' }}>ACCESS RESTRICTED</h5>
                    </Card.Header>
                    
                    <Card.Body className="p-5">
                        <div className="mb-4">
                            <h2 className="fw-bold" style={{ color: '#043873' }}>Account Suspended</h2>
                            <div style={{ 
                                width: '50px', 
                                height: '4px', 
                                background: '#FFE492', 
                                margin: '15px auto', 
                                borderRadius: '2px' 
                            }}></div>
                        </div>

                        <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                            We noticed your account status is currently set to <strong>Inactive</strong>. 
                            You do not have permission to access the <strong>TheDilution System</strong> at this time.
                        </p>
                        
                        <div className="alert alert-warning d-flex align-items-center mb-4 border-0" style={{ background: '#fffbeb', borderRadius: '12px', textAlign: 'left' }}>
                            <FaExclamationTriangle className="me-3 text-warning" size={20} />
                            <span className="small text-warning-emphasis fw-medium">Please contact your Department Head or IT Admin for reactivation.</span>
                        </div>
                        
                        <div className="d-grid gap-3">
                            <Button 
                                color="white" 
                                size="lg" 
                                onClick={logout}
                                className="shadow-sm py-3 fw-bold btn-custom-logout"
                                style={{ 
                                    borderRadius: '15px', 
                                    background: '#9e0d0d', 
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                <FaSignOutAlt /> Return to Login
                            </Button>

                            <small className="text-muted">
                                System Security Code: #AUTH_LOCK
                            </small>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default InactiveAccountOverlay;