// src/components/SecurityOverlay.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';

// Dynamically select protocol base to prevent Mixed Content security blocking
const JETSON_API_BASE = window.location.protocol === 'http:'
   ? ''
   : 'http://100.123.35.101:8000';

function SecurityOverlay({ isVisible, onVerified, onClose }) {
   const [isVerifying, setIsVerifying] = useState(false);
   const [status, setStatus] = useState("Initializing...");
   const [error, setError] = useState(null);

   // Cache the onVerified callback to prevent re-running the main useEffect
   const onVerifiedRef = useRef(onVerified);
   useEffect(() => {
       onVerifiedRef.current = onVerified;
   }, [onVerified]);

   useEffect(() => {
       let interval;
      
       const checkStatus = async () => {
           if (!isVisible) return;
          
           try {
               // 1. Check the machine status
               const res = await fetch(`${JETSON_API_BASE}/api/machine_status`);
              
               if (res.ok) {
                   const data = await res.json();
                  
                   // 2. Logic check: Did the AI find a match?
                   if (data.status === 'ACTIVE' && data.currentUser && data.currentUser !== 'MAINTENANCE') {
                       setIsVerifying(false);
                       if (onVerifiedRef.current) {
                           onVerifiedRef.current(data.currentUser);
                       }
                   } else {
                       if (data.latestRecognition && data.latestRecognition.name !== "Unknown") {
                           setStatus(`Scanning... (Detected: ${data.latestRecognition.name})`);
                       } else {
                           setStatus("Position your face in the frame");
                       }
                   }
               }
           } catch (err) {
               console.error("Polling failed:", err);
           }
       };

       if (isVisible) {
           setIsVerifying(true);
           setError(null);
           setStatus("Starting AI module...");
          
           // 3. MANDATORY: Tell Jetson to enter verification mode
           fetch(`${JETSON_API_BASE}/api/verification/start`, { method: 'POST' })
               .then(res => {
                   if (!res.ok) throw new Error("Could not start AI");
                   // Start polling once the AI is ready
                   interval = setInterval(checkStatus, 1000);
               })
               .catch(e => {
                   setError("Connection Failed: Ensure Jetson is online and robot.thedilution.my is accessible.");
               });
       }

       return () => {
           if (interval) clearInterval(interval);
           // 4. CLEANUP: Tell Jetson to stop looking for faces when we close
           if (isVisible) {
               fetch(`${JETSON_API_BASE}/api/verification/stop`, { method: 'POST' }).catch(() => {});
           }
       };
   }, [isVisible]);

   return (
       <Modal show={isVisible} onHide={onClose} backdrop="static" keyboard={false} centered className="um-modal">
           <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
               <Modal.Title>Face ID Verification</Modal.Title>
           </Modal.Header>
           <Modal.Body className="text-center p-4">
               {error ? (
                   <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>
               ) : (
                   <>
                       <p className="text-muted mb-3 fw-bold">{status}</p>
                      
                       <div className="video-container mb-3 shadow" style={{
                           borderRadius: '16px',
                           overflow: 'hidden',
                           backgroundColor: '#000',
                           aspectRatio: '4/3',
                           position: 'relative',
                           border: '4px solid #ffffff',
                           outline: '2px solid #043873'
                       }}>
                           {isVisible && (
                               <img
                                   // Point to /video_feed on the Jetson domain
                                   src={`${JETSON_API_BASE}/video_feed?t=${Date.now()}`}
                                   alt="Live Security Feed"
                                   style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                   onError={() => setError("Camera feed offline. Check backend logs.")}
                               />
                           )}
                       </div>
                      
                       {isVerifying && !error && (
                           <div className="d-flex justify-content-center align-items-center mt-3 text-primary">
                               <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                               <span className="fw-bold small text-uppercase">AI Active & Scanning...</span>
                           </div>
                       )}
                   </>
               )}
           </Modal.Body>
           <Modal.Footer className="bg-light border-0">
               <Button variant="secondary" className="rounded-pill px-4" onClick={onClose}>Cancel Access</Button>
           </Modal.Footer>
       </Modal>
   );
}

export default SecurityOverlay;