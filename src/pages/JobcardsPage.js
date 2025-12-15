import React, { useState } from 'react';
import { Card, Tabs, Tab } from 'react-bootstrap';
import JobcardManagementTab from '../components/tabs/JobcardManagementTab';
import RobotExecutionTab from '../components/tabs/RobotExecutionTab';
import SecurityOverlay from '../components/SecurityOverlay';
import '../styles/DrugManagement.css'; 

function JobcardsPage() {
    const [activeTab, setActiveTab] = useState('management');
    const [isRobotTabVerified, setIsRobotTabVerified] = useState(false);
    const [showSecurityCheck, setShowSecurityCheck] = useState(false);

    const handleTabSelect = (key) => {
        if (key === 'execution' && !isRobotTabVerified) {
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
        setIsRobotTabVerified(true);
        setShowSecurityCheck(false);
        setActiveTab('execution');
    };
    
    // --- NEW: This function will be called when the user clicks "Close" on the overlay ---
    const handleCloseSecurityCheck = () => {
        setShowSecurityCheck(false);      // Hide the overlay
        setActiveTab('management'); // Switch back to the Jobcard Management tab
    };

    return (
        <Card className="shadow-sm border-light-subtle">
            <Card.Header className="bg-white py-3">
                <h2 className="mb-0">Jobcard & Robot Control</h2>
            </Card.Header>
            <Card.Body className="position-relative">
                
                {/* --- Pass the new 'onClose' handler to the overlay --- */}
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
                        {isRobotTabVerified ? (
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