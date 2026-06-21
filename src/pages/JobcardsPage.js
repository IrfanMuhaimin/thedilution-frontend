// src/pages/JobcardsPage.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Tabs, Tab, Alert, Modal, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import JobcardManagementTab from '../components/tabs/JobcardManagementTab';
import RobotExecutionTab from '../components/tabs/RobotExecutionTab'; 
import SecurityOverlay from '../components/SecurityOverlay';
import '../styles/DrugManagement.css';

const IS_FACE_ID_ENABLED = true;

// Shared network base using your friend's protocol fallback logic
const JETSON_API_BASE = window.location.protocol === 'http:'
   ? ''
   : 'http://100.123.35.101:8000';

function JobcardsPage() {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState('management');
   
   // State Machine: 'idle' | 'first-scanning' | 'monitoring' | 'second-scanning' | 'dispensing'
   const [verificationPhase, setVerificationPhase] = useState(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
   const [timeLeft, setTimeLeft] = useState(120);

   const canAccessExecution = user ? (user.role === 'Admin' || user.role === 'Pharmacist' || user.role === 'Doctor') : false;

   // Ref pattern to eliminate React stale closure bugs inside useCallback hooks
   const phaseRef = useRef(verificationPhase);
   useEffect(() => {
       phaseRef.current = verificationPhase;
   }, [verificationPhase]);

   // 2-minute countdown timer loop
   useEffect(() => {
       let interval = null;
       if (verificationPhase === 'monitoring' && timeLeft > 0) {
           interval = setInterval(() => {
               setTimeLeft((prev) => prev - 1);
           }, 1000);
       } else if (verificationPhase === 'monitoring' && timeLeft === 0) {
           console.log("[Jobcards] Session limit hit. Prompting re-verification phase.");
           setVerificationPhase('second-scanning');
       }
       return () => {
           if (interval) clearInterval(interval);
       };
   }, [verificationPhase, timeLeft]);

   // Memoize the tab selection logic inside friend's layout framework
   const handleTabSelect = useCallback((key) => {
       if (key === 'execution') {
           if (phaseRef.current === 'monitoring' || phaseRef.current === 'second-scanning' || phaseRef.current === 'dispensing') {
               setActiveTab(key);
           } else if (canAccessExecution && IS_FACE_ID_ENABLED) {
               console.log("[Jobcards] Mounting first verification checkpoint.");
               setVerificationPhase('first-scanning');
               setActiveTab(key);
           } else {
               setActiveTab(key);
           }
       } else {
           console.log("[Jobcards] Terminating runtime visibility hooks.");
           setVerificationPhase(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
           setActiveTab(key);
       }
   }, [canAccessExecution]);

   // Dual-Phase success checkpoint tracking
   const handleVerificationSuccess = useCallback((recognizedUser) => {
       console.log(`[Jobcards] Biometric confirmation for: ${recognizedUser}. Current Stage: ${phaseRef.current}`);

       if (phaseRef.current === 'second-scanning') {
           console.log("[Jobcards] Second validation complete. Extending linear actuator...");
           setVerificationPhase('dispensing');

           fetch(`${JETSON_API_BASE}/api/actuator/extend`, { method: 'POST' })
               .then(res => {
                   if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                   return res.json();
               })
               .then(data => console.log("[Jobcards] Actuator extend API success:", data))
               .catch(err => console.error("[Jobcards] Failed to call extend API:", err));
       } else {
           console.log("[Jobcards] First checkpoint cleared. Mounting monitor stream.");
           setVerificationPhase('monitoring');
           setTimeLeft(120);
       }
   }, []);
 
   // Close/cancel handler
   const handleCloseSecurityCheck = useCallback(() => {
       setVerificationPhase(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
       setActiveTab('management');
   }, []);

   // Execute automated transition route
   const handleExecuteSuccess = useCallback(() => {
       handleTabSelect('execution');
   }, [handleTabSelect]);

   // Actuator extraction and state reset confirmation cycle
   const handleMedicineTaken = useCallback(() => {
       console.log("[Jobcards] Dispense confirmed. Retracting linear actuator door lock...");

       fetch(`${JETSON_API_BASE}/api/actuator/retract`, { method: 'POST' })
           .then(res => {
               if (!res.ok) throw new Error(`HTTP error ${res.status}`);
               return res.json();
           })
           .then(data => console.log("[Jobcards] Actuator retract API success:", data))
           .catch(err => console.error("[Jobcards] Failed to call retract API:", err));

       setVerificationPhase(IS_FACE_ID_ENABLED ? 'idle' : 'monitoring');
       setActiveTab('management'); 
   }, []);

   // Explicit state machine to component state mappings
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
                               {/* Realtime countdown system alert styled to blend with your friend's layout */}
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
                                           <small className="text-muted">Stay in view of the camera</small>
                                       </div>
                                   </Alert>
                               )}
                               
                               {/* Mounts friend's working multi-robot interface panel component */}
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

           {/* Medicine Taken Confirmation Drawer Popup */}
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
                       The linear actuator has extended, and the medicine door is now open.
                   </p>
                   <p className="text-muted mb-4 small">
                       Please retrieve your prescribed medicine, then confirm below to safely close and lock the cabinet.
                   </p>
                   <div className="my-3 d-flex justify-content-center align-items-center">
                       <Spinner animation="grow" variant="success" size="sm" className="me-2" />
                       <strong className="text-success text-uppercase small tracking-wider">Waiting for medicine retrieval...</strong>
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