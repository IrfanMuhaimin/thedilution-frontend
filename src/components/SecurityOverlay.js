// src/components/SecurityOverlay.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUserShield, FaExclamationTriangle, FaCamera} from 'react-icons/fa';

const getJetsonApiBase = () => {
    const { hostname, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://10.207.200.53:8000'; 
    }
    return protocol === 'http:' ? '' : 'http://100.123.35.101:8000'; 
};

const JETSON_API_BASE = getJetsonApiBase();

function SecurityOverlay({ isVisible, onVerified, onClose }) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [status, setStatus] = useState("Initializing...");
    const [error, setError] = useState(null);

    const darkRed = '#750000';
    const darkerRed = '#520000';

    const onVerifiedRef = useRef(onVerified);
    useEffect(() => {
        onVerifiedRef.current = onVerified;
    }, [onVerified]);

    useEffect(() => {
        let interval;
        
        const checkStatus = async () => {
            if (!isVisible) return;
            
            try {
                const res = await fetch(`${JETSON_API_BASE}/api/machine_status`);
                
                if (res.ok) {
                    const data = await res.json();
                    
                    // FIXED: Removed the "!== 'MAINTENANCE'" restriction so maintenance tokens can pass
                    if (data.status === 'ACTIVE' && data.currentUser) {
                        setIsVerifying(false);
                        if (onVerifiedRef.current) {
                            onVerifiedRef.current(data.currentUser);
                        }
                    } else {
                        if (data.latestRecognition && data.latestRecognition.name !== "Unknown") {
                            setStatus(`Scanning... (Detected: ${data.latestRecognition.name})`);
                        } else {
                            setStatus("Please position your face directly in front of the camera frame.");
                        }
                    }
                }
            } catch (err) {
                console.error("Biometric polling failed:", err);
            }
        };

        if (isVisible) {
            setIsVerifying(true);
            setError(null);
            setStatus("Initializing Edge AI camera stream...");
            
            fetch(`${JETSON_API_BASE}/api/verification/start`, { method: 'POST' })
                .then(res => {
                    if (!res.ok) throw new Error("Could not start AI");
                    interval = setInterval(checkStatus, 1000);
                })
                .catch(e => {
                    setError("Biometric Offline: Ensure your Jetson Orin Nano is powered on.");
                });
        }

        return () => {
            if (interval) clearInterval(interval);
            if (isVisible) {
                fetch(`${JETSON_API_BASE}/api/verification/stop`, { method: 'POST' }).catch(() => {});
            }
        };
    }, [isVisible]);

    // Manual breakout function for development and debugging overrides
    const handleManualBypass = () => {
        setIsVerifying(false);
        if (onVerifiedRef.current) {
            // Fires the verified event instantly with a fallback profile label
            onVerifiedRef.current("ADMIN_OVERRIDE"); 
        }
    };

    return (
        <Modal show={isVisible} onHide={onClose} backdrop="static" keyboard={false} centered className="um-modal">
            <Modal.Header closeButton style={{ background: `linear-gradient(135deg, ${darkRed} 0%, ${darkerRed} 100%)`, border: 'none' }}>
                <Modal.Title className="text-white fw-bold">
                    <FaUserShield className="me-2 text-warning" /> Biometric Identity Verification
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-4 bg-light">
                {error ? (
                    <Alert variant="danger" className="border-0 shadow-sm d-flex align-items-center text-start">
                        <FaExclamationTriangle className="me-3" size={24} />
                        <div>{error}</div>
                    </Alert>
                ) : (
                    <>
                        <div className="small fw-bold text-uppercase text-secondary mb-3 d-flex align-items-center justify-content-center">
                            <FaCamera className="me-2" /> Live Camera Stream
                        </div>
                        
                        <div className="video-container mb-4 shadow" style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                            aspectRatio: '4/3',
                            position: 'relative',
                            border: '4px solid #ffffff',
                            outline: `2px solid ${darkRed}`
                        }}>
                            {isVisible && (
                                <img
                                    src={`${JETSON_API_BASE}/video_feed?t=${Date.now()}`}
                                    alt="Live Security Feed"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={() => setError("Biometric offline. Check network logs.")}
                                />
                            )}
                        </div>
                        
                        <p className="text-muted fw-semibold small px-3 mb-0" style={{ minHeight: '30px' }}>
                            {status}
                        </p>
                        
                        {isVerifying && !error && (
                            <div className="d-flex justify-content-center align-items-center mt-3" style={{ color: darkRed }}>
                                <Spinner animation="grow" size="sm" className="me-2" style={{ backgroundColor: darkRed }} />
                                <span className="fw-bold small text-uppercase">AI Scanner Active</span>
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
            {/* Added standard layout controls to offer a clean exit path */}
            <Modal.Footer className="bg-white border-0 pb-4 d-flex justify-content-center gap-2">
                <Button variant="secondary" className="rounded-pill px-4" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="outline-danger" className="rounded-pill px-4" onClick={handleManualBypass}>
                    Bypass Face ID
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SecurityOverlay;