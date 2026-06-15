// src/pages/FaceIdPage.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { FaDesktop } from 'react-icons/fa';

function FaceIdPage() {
    // IP address of your physical Jetson Orin Nano
    const JETSON_DASHBOARD_URL = 'http://100.123.35.101:5173';
    const [isConnecting, setIsConnecting] = useState(true);

    useEffect(() => {
        const initializeRegistration = async () => {
            try {
                // Give a 1s delay to simulate a premium network connection handshake
                setTimeout(() => {
                    setIsConnecting(false);
                }, 1000);
            } catch (error) {
                console.error('Connection failed to Jetson Orin Nano:', error);
                setIsConnecting(false);
            }
        };
        initializeRegistration();
    }, []);

    return (
        <Row className="animate-fade-in">
            <Col lg={12} className="mb-4">
                <Card className="shadow-sm h-100 border-0 rounded-4 overflow-hidden">
                    <Card.Header className="text-white d-flex align-items-center py-3" style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)' }}>
                        <FaDesktop className="me-2 text-warning" />
                        <h3 className="mb-0 fs-5 fw-bold">Edge AI Security Dashboard (Live Feed)</h3>
                    </Card.Header>
                    <Card.Body className="p-0 text-center d-flex flex-column" style={{ minHeight: '800px', backgroundColor: '#f8fafc' }}>
                        {isConnecting ? (
                            <div className="d-flex flex-column justify-content-center align-items-center h-100 py-5" style={{ minHeight: '800px' }}>
                                <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px', borderWidth: '4px' }} />
                                <p className="mt-3 text-muted fw-bold">Connecting to Jetson Orin Nano node...</p>
                            </div>
                        ) : (
                            <iframe 
                                src={JETSON_DASHBOARD_URL} 
                                title="Jetson Nano Security Dashboard" 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    minHeight: '800px',
                                    border: 'none',
                                    backgroundColor: 'transparent'
                                }}
                                allow="camera; microphone; fullscreen"
                            ></iframe>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default FaceIdPage;