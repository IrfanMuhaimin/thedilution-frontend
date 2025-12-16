import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import * as robotService from '../../services/robotService';
import '../../styles/RobotExecutionTab.css';

function RobotExecutionTab() {
    const [logs, setLogs] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [isTriggering, setIsTriggering] = useState(false);
    const [error, setError] = useState('');
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            const data = await robotService.fetchTaskLogs();
            setLogs(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch task logs. The robot API might be offline.');
        } finally {
            setIsLoadingLogs(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        const intervalId = setInterval(fetchLogs, 5000);
        return () => clearInterval(intervalId);
    }, [fetchLogs]);

    const handleRunTask = async (taskName) => {
        setIsTriggering(true);
        setStatusMessage(`Sending command: ${taskName}...`);
        try {
            // Using the existing triggerTask function which correctly calls the API
            const response = await robotService.triggerTask(taskName);
            const logId = parseInt(response);
            if (isNaN(logId)) {
                throw new Error(`Server returned an invalid response: ${response}`);
            }
            setStatusMessage(`✅ Success! Task '${taskName}' triggered with ID ${logId}.`);
            fetchLogs();
        } catch (err) {
            setStatusMessage(`❌ Error sending command: ${err.message}`);
        } finally {
            setIsTriggering(false);
        }
    };
    
    const getStatusStyle = (status) => {
        if (!status) return { color: '#6c757d', fontWeight: 'bold' };
        const upperStatus = status.toUpperCase();
        if (upperStatus.includes('RUNNING')) return { color: '#007bff', fontWeight: 'bold' };
        if (upperStatus === 'PENDING' || upperStatus === 'NULL') return { color: '#6c757d', fontWeight: 'bold' };
        if (upperStatus === 'FINISHED') return { color: '#28a745', fontWeight: 'bold' };
        if (upperStatus.includes('ERROR') || upperStatus.includes('BROKEN')) return { color: '#dc3545', fontWeight: 'bold' };
        return { color: '#343a40', fontWeight: 'bold' };
    };

    return (
        <div>
            <h3 className="text-center mb-3">Robot Arm 3D Simulation</h3>
            <div className="webgl-viewer-container">
                {/* --- THIS IS THE CORRECTED URL --- */}
                <iframe 
                    id="webgl-viewer" 
                    src="https://robot.thedilution.my/robotarm/TheDilution2/" // The full public URL to the WebGL build
                    title="Robot Arm WebGL Simulation"
                    allow="fullscreen"
                    sandbox="allow-scripts allow-same-origin"
                ></iframe>
            </div>

            <div className="controls">
                <Button variant="success" onClick={() => handleRunTask('task1')} disabled={isTriggering}>
                    {isTriggering ? <Spinner as="span" animation="border" size="sm"/> : 'Run Task 1 (Robot Arm)'}
                </Button>
                <Button variant="primary" onClick={() => handleRunTask('task2')} disabled={isTriggering}>
                    {isTriggering ? <Spinner as="span" animation="border" size="sm"/> : 'Run Task 2 (Other)'}
                </Button>
            </div>
            
            {statusMessage && <Alert variant="info" className="text-center mt-3">{statusMessage}</Alert>}
            {error && <Alert variant="danger" className="text-center mt-3">{error}</Alert>}

            <h3 className="mt-4 text-center">Task History & Status</h3>
            <div className="log-table-container">
                <Table striped bordered hover responsive>
                    <thead className="table-light">
                        <tr>
                            <th rowSpan="2" className="align-middle">ID</th>
                            <th rowSpan="2" className="align-middle">Task Name</th>
                            <th rowSpan="2" className="align-middle">Start Time</th>
                            <th colSpan="2" className="pi-header text-center">Raspberry Pi (Physical)</th>
                            <th colSpan="2" className="unity-header text-center">Unity (Virtual)</th>
                            <th rowSpan="2" className="align-middle">Details</th>
                        </tr>
                        <tr>
                            <th className="pi-header text-center">Status</th><th className="pi-header text-center">Dur. (s)</th>
                            <th className="unity-header text-center">Status</th><th className="unity-header text-center">Dur. (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingLogs ? (
                            <tr><td colSpan="8" className="text-center p-4"><Spinner animation="border" /></td></tr>
                        ) : logs.length > 0 ? logs.map(log => (
                            <tr key={log.log_id}>
                                <td>{log.log_id || 'N/A'}</td>
                                <td>{log.task_name || 'N/A'}</td>
                                <td>{log.start_time || 'N/A'}</td>
                                <td style={getStatusStyle(log.pi_status)}>{log.pi_status || 'NULL'}</td>
                                <td>{log.pi_duration_seconds ?? 'N/A'}</td>
                                <td style={getStatusStyle(log.unity_status)}>{log.unity_status || 'NULL'}</td>
                                <td>{log.unity_duration_seconds ?? 'N/A'}</td>
                                <td className="text-start">{log.message || ''}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" className="text-center text-muted p-4">No task history recorded yet.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default RobotExecutionTab;