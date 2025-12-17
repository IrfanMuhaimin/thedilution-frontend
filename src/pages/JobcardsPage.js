import React, { useState } from 'react';
import { Card, Tabs, Tab, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import JobcardManagementTab from '../components/tabs/JobcardManagementTab';
import RobotExecutionTab from '../components/tabs/RobotExecutionTab';
import SecurityOverlay from '../components/SecurityOverlay';
import '../styles/DrugManagement.css'; 

// --- DEVELOPMENT SWITCH: Set this to 'false' to disable the Face ID check ---
const IS_FACE_ID_ENABLED = true;

function JobcardsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('management');
    const [isVerified, setIsVerified] = useState(!IS_FACE_ID_ENABLED); // If security is disabled, we are "verified" by default
    const [showSecurityCheck, setShowSecurityCheck] = useState(false);

    if (!user) {
        return null; 
    }

    const canAccessExecution = user.role === 'Admin' || user.role === 'Pharmacist';

    const handleTabSelect = (key) => {
        // --- The security check is now conditional based on our switch ---
        if (key === 'execution' && canAccessExecution && !isVerified && IS_FACE_ID_ENABLED) {
            setShowSecurityCheck(true);
            setActiveTab(key); 
        } else {
            setActiveTab(key);
            if (key !== 'execution') {
                setShowSecurityCheck(false);
            }
        }
    };

    const handleVerificationSuccess = () => {
        setIsVerified(true);
        setShowSecurityCheck(false);
        setActiveTab('execution');
    };
    
    const handleCloseSecurityCheck = () => {
        setShowSecurityCheck(false);
        setActiveTab('management');
    };

    return (
        <Card className="shadow-sm border-light-subtle">
            <Card.Header className="bg-white py-3">
                <h2 className="mb-0">Jobcard & Robot Control</h2>
            </Card.Header>
            <Card.Body className="position-relative">
                
                <SecurityOverlay 
                    isVisible={showSecurityCheck} 
                    onVerified={handleVerificationSuccess} 
                    onClose={handleCloseSecurityCheck}
                />
                
                <Tabs
                    activeKey={activeTab}
                    onSelect={handleTabSelect}
                    id="jobcard-tabs"
                    className="drug-management-tabs"
                    justify
                >
                    <Tab eventKey="management" title="Jobcard Management">
                        <JobcardManagementTab onExecuteSuccess={() => handleTabSelect('execution')} />
                    </Tab>
                    <Tab eventKey="execution" title="Robot Execution & Monitoring">
                        {!canAccessExecution ? (
                            <div className="text-center p-5">
                                <Alert variant="warning">
                                    <Alert.Heading>Access Denied</Alert.Heading>
                                    <p>Your role ({user.role}) does not have permission to access this feature.</p>
                                </Alert>
                            </div>
                        ) : isVerified ? (
                            <RobotExecutionTab />
                        ) : (
                            <div className="text-center p-5">
                                <h4 className="text-muted">Security verification is required to access this content.</h4>
                            </div>
                        )}
                    </Tab>
                </Tabs>
            </Card.Body>
        </Card>
    );
}

export default JobcardsPage;