import React, { useState, useEffect, useCallback} from 'react';
import { Table, Button, Alert, Spinner, Form, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaRobot, FaExclamationTriangle, FaCircle, FaLock } from 'react-icons/fa';
import { useLocation } from 'react-router-dom'; // NEW
import * as hardwareService from '../../services/hardwareService';
import * as robotService from '../../services/robotService';
import '../../styles/RobotExecutionTab.css';

function RobotExecutionTab() {
    const location = useLocation(); // NEW
    const [hardwareList, setHardwareList] = useState([]);
    const [selectedHardware, setSelectedHardware] = useState(null);
    const [isLocked, setIsLocked] = useState(false); // NEW: Dropdown lock state
    const [logs, setLogs] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [isTriggering, setIsTriggering] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch available active hardware devices
    useEffect(() => {
        hardwareService.getAllHardware()
            .then(data => {
                const activeUnits = data.filter(h => h.status && !h.isArchived);
                setHardwareList(activeUnits);
                
                // Check if we arrived here because of an active execution redirect
                if (location.state && location.state.activeExecutionHardwareId) {
                    const lockedId = parseInt(location.state.activeExecutionHardwareId, 10);
                    const lockedHw = activeUnits.find(h => h.hardwareId === lockedId);
                    if (lockedHw) {
                        setSelectedHardware(lockedHw);
                        setIsLocked(true); // LOCK THE DROPDOWN
                    }
                } else if (activeUnits.length > 0) {
                    setSelectedHardware(activeUnits[0]);
                }
                setIsLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch robotic hardware fleet.");
                setIsLoading(false);
            });
    }, [location.state]);

    // 2. Fetch logs for the selected hardware only
    const fetchLogs = useCallback(async () => {
        if (!selectedHardware) return;
        try {
            const data = await robotService.fetchTaskLogs(selectedHardware.hardwareId);
            setLogs(data);
        } catch (err) {
            console.error("Failed to fetch logs for unit:", selectedHardware.name);
        }
    }, [selectedHardware]);

    useEffect(() => {
        fetchLogs();
        const intervalId = setInterval(fetchLogs, 5000);
        return () => clearInterval(intervalId);
    }, [fetchLogs]);

    const handleHardwareChange = (e) => {
        const hwId = parseInt(e.target.value, 10);
        const selected = hardwareList.find(h => h.hardwareId === hwId);
        setSelectedHardware(selected);
        setLogs([]); 
    };

    const handleRunTask = async (taskName) => {
        if (!selectedHardware) return;
        setIsTriggering(true);
        setStatusMessage(`Sending manual task to ${selectedHardware.name}...`);
        try {
            const response = await robotService.triggerTask(taskName, selectedHardware.hardwareId);
            const logId = parseInt(response);
            if (isNaN(logId)) throw new Error(`Invalid response: ${response}`);
            setStatusMessage(`✅ Handshake verified! Task triggered with ID ${logId}.`);
            fetchLogs();
        } catch (err) {
            setStatusMessage(`❌ Error: ${err.message}`);
        } finally {
            setIsTriggering(false);
        }
    };
    
    const getStatusStyle = (status) => {
        if (!status) return { color: '#6c757d', fontWeight: 'bold' };
        const upperStatus = status.toUpperCase();
        if (upperStatus.includes('RUNNING')) return { color: '#007bff', fontWeight: 'bold' };
        if (upperStatus === 'FINISHED') return { color: '#28a745', fontWeight: 'bold' };
        if (upperStatus.includes('ERROR') || upperStatus.includes('BROKEN')) return { color: '#dc3545', fontWeight: 'bold' };
        return { color: '#6c757d', fontWeight: 'bold' };
    };

    if (isLoading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div>
            {/* MACHINE SELECTOR */}
            <Card className="border-0 shadow-sm mb-4 rounded-4 bg-light">
                <Card.Body className="p-3">
                    <Row className="align-items-center">
                        <Col md={6}>
                            <Form.Group className="mb-0">
                                <Form.Label className="small fw-bold text-primary">
                                    <FaRobot className="me-2"/>
                                    {isLocked ? "MONITORING ACTIVE EXECUTION UNIT" : "SELECT ROBOTIC UNIT TO MONITOR"}
                                </Form.Label>
                                {/* --- COMPULSORY LOCK: Disable dropdown if active execution is running --- */}
                                <Form.Select 
                                    value={selectedHardware?.hardwareId || ''} 
                                    onChange={handleHardwareChange}
                                    disabled={isLocked} // Lock it!
                                    className={isLocked ? "border-success bg-white fw-bold text-success" : ""}
                                >
                                    {hardwareList.map(hw => (
                                        <option key={hw.hardwareId} value={hw.hardwareId}>{hw.name} (Ports: {hw.availablePorts})</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="text-end mt-3 mt-md-0">
                            {selectedHardware && (
                                <div className="d-flex flex-column align-items-end gap-1">
                                    <span className="custom-status-badge bg-status-active shadow-sm py-2 text-lowercase">
                                        <FaCircle className="me-2" size={10} /> Endpoint: {selectedHardware.apiEndpoint || 'Local Gateway'}
                                    </span>
                                    {isLocked && (
                                        <Badge bg="success" className="px-3 py-2 rounded-pill shadow-sm d-flex align-items-center">
                                            <FaLock className="me-2" /> HARDWARE INTERFACE LOCKED
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* DYNAMIC 3D DIGITAL TWIN */}
            <h3 className="text-center mb-3 text-primary fw-bold">{selectedHardware?.name || 'Robotic'} 3D Simulation</h3>
            {selectedHardware?.digitalTwinUrl ? (
                <div className="webgl-viewer-container shadow rounded-4 overflow-hidden mb-4 border">
                    <iframe 
                        id="webgl-viewer" 
                        src={selectedHardware.digitalTwinUrl} 
                        title={`${selectedHardware.name} Digital Twin`}
                        allow="fullscreen"
                        sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                </div>
            ) : (
                <Card className="border-0 shadow-sm rounded-4 p-5 text-center mb-4 border-start border-4 border-danger" style={{ backgroundColor: '#fff5f5' }}>
                    <Card.Body className="py-4">
                        <FaExclamationTriangle size={48} className="text-danger mb-3" />
                        <h4 className="fw-bold text-danger">Digital Twin Not Available</h4>
                        <p className="text-muted mb-0 max-width-md mx-auto" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                            The virtual telemetry system has not been mapped for <strong>{selectedHardware?.name}</strong>.<br />
                            Please contact your System Administrator to upload the WebGL asset.
                        </p>
                    </Card.Body>
                </Card>
            )}

            {/* CONTROLS */}
            <div className="controls mb-4">
                <Button variant="success" className="rounded-pill px-4 shadow-sm me-3" onClick={() => handleRunTask('task1')} disabled={isTriggering || !selectedHardware}>
                    {isTriggering ? <Spinner as="span" animation="border" size="sm"/> : 'Run Task 1 (Robot Arm)'}
                </Button>
                <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={() => handleRunTask('task2')} disabled={isTriggering || !selectedHardware}>
                    {isTriggering ? <Spinner as="span" animation="border" size="sm"/> : 'Run Task 2 (Centrifuge)'}
                </Button>
                {isLocked && (
                    <Button variant="outline-secondary" className="rounded-pill px-4 shadow-sm ms-3" onClick={() => { setIsLocked(false); setStatusMessage(''); }}>
                        Unlock Selector
                    </Button>
                )}
            </div>
            
            {statusMessage && <Alert variant="info" className="text-center rounded-3 mb-4">{statusMessage}</Alert>}
            {error && <Alert variant="danger" className="text-center rounded-3 mb-4">{error}</Alert>}

            <h3 className="mt-4 text-center text-primary fw-bold">Execution History & Status</h3>
            <div className="log-table-container bg-white rounded-4 shadow-sm overflow-hidden border">
                <Table hover responsive className="align-middle mb-0 text-center">
                    <thead className="table-light text-muted small text-uppercase">
                        <tr>
                            <th rowSpan="2" className="align-middle ps-4">ID</th>
                            <th rowSpan="2" className="align-middle">Task Name</th>
                            <th rowSpan="2" className="align-middle">Start Time</th>
                            <th colSpan="2" className="pi-header text-center" style={{ backgroundColor: '#e2f0fe', color: '#043873' }}>Raspberry Pi (Physical)</th>
                            <th colSpan="2" className="unity-header text-center" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>Unity (Virtual)</th>
                            <th rowSpan="2" className="align-middle pe-4">Details</th>
                        </tr>
                        <tr>
                            <th className="pi-header text-center" style={{ backgroundColor: '#f0f7ff' }}>Status</th>
                            <th className="pi-header text-center" style={{ backgroundColor: '#f0f7ff' }}>Dur. (s)</th>
                            <th className="unity-header text-center" style={{ backgroundColor: '#fffdf5' }}>Status</th>
                            <th className="unity-header text-center" style={{ backgroundColor: '#fffdf5' }}>Dur. (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log.log_id}>
                                <td className="ps-4 fw-bold">#{log.log_id}</td>
                                <td>{log.task_name}</td>
                                <td className="small text-muted">{log.start_time}</td>
                                <td style={getStatusStyle(log.pi_status)}>{log.pi_status || 'NULL'}</td>
                                <td>{log.pi_duration_seconds ?? 'N/A'}</td>
                                <td style={getStatusStyle(log.unity_status)}>{log.unity_status || 'NULL'}</td>
                                <td>{log.unity_duration_seconds ?? 'N/A'}</td>
                                <td className="text-start pe-4 small text-muted">{log.message}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" className="text-center text-muted p-4">No task history recorded for this unit.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default RobotExecutionTab;