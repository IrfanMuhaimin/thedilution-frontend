// src/pages/JobcardsPage.js
import React, { useState, useCallback } from 'react';
import { Card, Tabs, Tab, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import JobcardManagementTab from '../components/tabs/JobcardManagementTab';
import RobotExecutionTab from '../components/tabs/RobotExecutionTab'; // Restored your custom fleet tab component
import SecurityOverlay from '../components/SecurityOverlay';
import '../styles/DrugManagement.css';

// --- DEVELOPMENT SWITCH: Set this to 'false' to disable the Face ID check ---
const IS_FACE_ID_ENABLED = true;

function JobcardsPage() {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState('management');
   const [isVerified, setIsVerified] = useState(!IS_FACE_ID_ENABLED); // Verified by default if security is off
   const [showSecurityCheck, setShowSecurityCheck] = useState(false);

   const canAccessExecution = user ? (user.role === 'Admin' || user.role === 'Pharmacist' || user.role === 'Doctor') : false;

   // Memoize the tab selection logic
   const handleTabSelect = useCallback((key) => {
       if (key === 'execution' && canAccessExecution && !isVerified && IS_FACE_ID_ENABLED) {
           setShowSecurityCheck(true);
           setActiveTab(key);
       } else {
           setActiveTab(key);
           if (key !== 'execution') {
               setShowSecurityCheck(false);
           }
       }
   }, [canAccessExecution, isVerified]);

   // Memoize success handler
   const handleVerificationSuccess = useCallback(() => {
       console.log(`Access granted by Face ID.`);
       setIsVerified(true);
       setShowSecurityCheck(false);
       setActiveTab('execution');
   }, []);
 
   // Memoize cancel/close handler
   const handleCloseSecurityCheck = useCallback(() => {
       setShowSecurityCheck(false);
       setActiveTab('management');
   }, []);

   // Memoize execute transition
   const handleExecuteSuccess = useCallback(() => {
       handleTabSelect('execution');
   }, [handleTabSelect]);

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
                           // MOUNT DYNAMIC MULTI-ROBOT COMPONENT
                           <RobotExecutionTab />
                       ) : (
                           <div className="text-center p-5">
                               <h4 className="text-muted fw-semibold">Biometric authentication is required to access the live execution node.</h4>
                           </div>
                       )}
                   </Tab>
               </Tabs>
           </Card.Body>
       </Card>
   );
}

export default JobcardsPage;