// src/pages/JobcardsPage.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Tabs, Tab, Alert, Modal, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import JobcardManagementTab from '../components/tabs/JobcardManagementTab';
import RobotExecutionTab from '../components/tabs/RobotExecutionTab'; 
import SecurityOverlay from '../components/SecurityOverlay';
import '../styles/DrugManagement.css';

const IS_FACE_ID_ENABLED = true;

// Tailscale Smart API Resolution base path
const JETSON_API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://100.123.35.101:8000'
    : (window.location.protocol === 'http:' ? '' : 'http://100.123.35.101:8000');

function JobcardsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('management');
    
    // Integrated State Machine: 'idle' | 'first-scanning' | 'monitoring' | 'second-scanning' | 'dispensing'
    const [verificationPhase, setVerificationPhase] = useState(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
    const [timeLeft, setTimeLeft] = useState(120);

    // Kept Doctor alongside Admin and Pharmacist from your friend's implementation
    const canAccessExecution = user ? (user.role === 'Admin' || user.role === 'Pharmacist' || user.role === 'Doctor') : false;

    // Ref design to handle React hook closure snapshots safely during async events
    const phaseRef = useRef(verificationPhase);
    useEffect(() => {
        phaseRef.current = verificationPhase;
    }, [verificationPhase]);

    useEffect(() => {
        console.log(`[Jobcards] System API Node resolved to: "${JETSON_API_BASE}"`);
    }, []);

    // 2-Minute Session Countdown Loop
    useEffect(() => {
        let interval = null;
        if (verificationPhase === 'monitoring' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (verificationPhase === 'monitoring' && timeLeft === 0) {
            console.log("[Jobcards] Session countdown reached limits. Forcing re-verification flag.");
            setVerificationPhase('second-scanning');
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [verificationPhase, timeLeft]);

    // Tab Redirection Handler Map
    const handleTabSelect = useCallback((key) => {
        if (key === 'execution') {
            if (phaseRef.current === 'monitoring' || phaseRef.current === 'second-scanning' || phaseRef.current === 'dispensing') {
                setActiveTab(key);
            } else if (canAccessExecution && IS_FACE_ID_ENABLED) {
                console.log("[Jobcards] Shifting view context to Execution. Mounting verification checkpoint.");
                setVerificationPhase('first-scanning');
                setActiveTab(key);
            } else {
                setActiveTab(key);
            }
        } else {
            console.log("[Jobcards] Shifting view context to Management. Closing secure nodes.");
            setVerificationPhase(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
            setActiveTab(key);
        }
    }, [canAccessExecution]);

    // Multi-Phase Success Checkpoint Handler
    const handleVerificationSuccess = useCallback((recognizedUser) => {
        console.log(`[Jobcards] Biometric match accepted for: ${recognizedUser}. Current Stage: ${phaseRef.current}`);

        if (phaseRef.current === 'second-scanning') {
            console.log("[Jobcards] Passphrase verified. Sending extend command to Actuator Node...");
            setVerificationPhase('dispensing');

            fetch(`${JETSON_API_BASE}/api/actuator/extend`, { method: 'POST' })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP error status ${res.status}`);
                    return res.json();
                })
                .then(data => console.log("[Jobcards] Actuator fully extended:", data))
                .catch(err => console.error("[Jobcards] Critical Actuator error:", err));
        } else {
            console.log("[Jobcards] Master signature verified. Loading access tokens.");
            setVerificationPhase('monitoring');
            setTimeLeft(120);
        }
    }, []);

    // Graceful cancellation escape path
    const handleCloseSecurityCheck = useCallback(() => {
        setVerificationPhase(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
        setActiveTab('management');
    }, []);

    const handleExecuteSuccess = useCallback(() => {
        handleTabSelect('execution');
    }, [handleTabSelect]);

    // Post-dispensing confirmation cycle handler
    const handleMedicineTaken = useCallback(() => {
        console.log("[Jobcards] Confirming storage clearance status. Sending retract command to Actuator Node...");

        fetch(`${JETSON_API_BASE}/api/actuator/retract`, { method: 'POST' })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error status ${res.status}`);
                return res.json();
            })
            .then(data => console.log("[Jobcards] Actuator locked securely:", data))
            .catch(err => console.error("[Jobcards] Actuator containment failure:", err));

        setVerificationPhase(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
        setActiveTab('management'); 
    }, []);

    // Derived flags mapping state machine positions to UI sub-components
    const showSecurityCheck = verificationPhase === 'first-scanning' || verificationPhase === 'second-scanning';
    const isVerified = verificationPhase === 'monitoring' || verificationPhase === 'second-scanning' || verificationPhase === 'dispensing';
    const showMedicinePopup = verificationPhase === 'dispensing';
    const isSecondVerification = verificationPhase === 'second-scanning';

    if (!user) {
        return null;
    }

    return (
        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
            <Card.Header className="bg-white py-3 border-0">
                <h2 className="mb-0 text-primary fw-bold">Jobcard & Robot Control</h2>
            </Card.Header>
            <Card.Body className="position-relative p-0">
              
                <SecurityOverlay
                    isVisible={showSecurityCheck}
                    onVerified={handleVerificationSuccess}
                    onClose={handleCloseSecurityCheck}
                    isSecondVerification={isSecondVerification}
                />
              
                <Tabs
                    activeKey={activeTab}
                    onSelect={handleTabSelect}
                    id="jobcard-tabs"
                    className="drug-management-tabs px-3 pt-2"
                    justify
                >
                    <Tab eventKey="management" title="Jobcard Management" className="p-4">
                        <JobcardManagementTab onExecuteSuccess={handleExecuteSuccess} />
                    </Tab>
                    <Tab eventKey="execution" title="Robot Execution & Monitoring" className="p-4">
                        {!canAccessExecution ? (
                            <div className="text-center p-5">
                                <Alert variant="warning" className="border-0 shadow-sm">
                                    <Alert.Heading>Access Denied</Alert.Heading>
                                    <p className="mb-0">Your role ({user.role}) does not have permission to access the hardware interface.</p>
                                </Alert>
                            </div>
                        ) : isVerified ? (
                            <>
                                {/* Integrated custom timer overlay onto your friend's tab layout */}
                                {verificationPhase === 'monitoring' && (
                                    <Alert variant="info" className="d-flex justify-content-between align-items-center py-2 px-3 mb-3 border-0 shadow-sm rounded-3">
                                        <div>
                                            <strong>🔒 Session Lock Active:</strong> Re-verification required in{" "}
                                            <span className="font-monospace fw-bold text-danger">
                                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <Spinner animation="grow" variant="info" size="sm" className="me-2" />
                                            <small className="text-muted">Stay within tracking line-of-sight</small>
                                        </div>
                                    </Alert>
                                )}
                                
                                {/* Successfully mounting friend's core multi-robot node component */}
                                <RobotExecutionTab />
                            </>
                        ) : (
                            <div className="text-center p-5">
                                <h4 className="text-muted fw-semibold">Biometric authentication is required to access the live execution node.</h4>
                            </div>
                        )}
                    </Tab>
                </Tabs>
            </Card.Body>

            {/* Medicine Confirmation Drawer Trigger Popup */}
            <Modal 
                show={showMedicinePopup} 
                backdrop="static" 
                keyboard={false} 
                centered
                className="um-modal"
            >
                <Modal.Header className="bg-primary text-white border-0 py-3">
                    <Modal.Title className="fw-bold">🔓 Cabinet Door Unlocked</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4 px-5">
                    <p className="fs-5 mb-3 fw-semibold text-dark">
                        The linear actuator has extended, and the cabinet storage bay is now open.
                    </p>
                    <p className="text-muted mb-4 small">
                        Please retrieve the prepared context compounding profile from the cabinet. Once complete, confirm closure below to retract containment components.
                    </p>
                    <div className="my-3 d-flex justify-content-center align-items-center">
                        <Spinner animation="grow" variant="success" size="sm" className="me-2" />
                        <strong className="text-success text-uppercase small tracking-wider">Waiting for collection signature...</strong>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border-0 pb-4 bg-light">
                    <Button 
                        variant="success" 
                        size="lg" 
                        onClick={handleMedicineTaken} 
                        className="rounded-pill px-5 fw-bold shadow-sm"
                    >
                        Yes, I have taken the medicine
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}

export default JobcardsPage;