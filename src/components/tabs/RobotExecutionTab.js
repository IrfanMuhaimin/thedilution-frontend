import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import * as robotService from '../../services/robotService';
import '../../styles/RobotExecutionTab.css';

// --- Check if we are in the local development environment ---
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Mock data for development mode
const mockLogs = [
    { log_id: 101, task_name: 'Simulated Dilution', start_time: new Date().toLocaleString(), pi_status: 'FINISHED', pi_duration_seconds: 45, unity_status: 'FINISHED', unity_duration_seconds: 44, message: 'Paracetamol 500mg (Simulated)' },
    { log_id: 100, task_name: 'Simulated Calibration', start_time: new Date().toLocaleString(), pi_status: 'PENDING', pi_duration_seconds: null, unity_status: 'RUNNING', unity_duration_seconds: null, message: 'Running self-check (Simulated)' },
];

function RobotExecutionTab() {
    const [logs, setLogs] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [isTriggering, setIsTriggering] = useState(false);
    const [error, setError] = useState('');

    const fetchLogs = useCallback(async () => {
        // --- DEVELOPMENT MODE LOGIC ---
        if (IS_DEVELOPMENT) {
            setLogs(mockLogs); // Use mock data
            return; // Stop here, don't make a real API call
        }

        // --- PRODUCTION LOGIC ---
        try {
            const data = await robotService.fetchTaskLogs();
            setLogs(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch task logs. The robot API might be offline.');
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        // In production, we still poll. In dev, this just re-sets the mock data.
        const intervalId = setInterval(fetchLogs, 5000);
        return () => clearInterval(intervalId);
    }, [fetchLogs]);

    const handleRunTask = async (taskName, message = '') => {
        setIsTriggering(true);
        setStatusMessage(`Sending command: ${taskName}...`);

        // --- DEVELOPMENT MODE LOGIC ---
        if (IS_DEVELOPMENT) {
            setTimeout(() => {
                setStatusMessage(`✅ Success! Task '${taskName}' triggered (Simulated).`);
                setIsTriggering(false);
            }, 1000);
            return;
        }

        // --- PRODUCTION LOGIC ---
        try {
            const response = await robotService.triggerTask(taskName, message);
            setStatusMessage(`✅ Success! Task '${taskName}' triggered with ID ${response.log_id}.`);
            fetchLogs();
        } catch (err) {
            setStatusMessage(`❌ Error sending command: ${err.message}`);
        } finally {
            setIsTriggering(false);
        }
    };

    const getStatusStyle = (status) => {
        if (!status) return {};
        const upperStatus = status.toUpperCase();
        if (upperStatus.includes('RUNNING')) return { color: '#007bff', fontWeight: 'bold' };
        if (upperStatus === 'PENDING') return { color: '#6c757d', fontWeight: 'bold' };
        if (upperStatus === 'FINISHED') return { color: '#28a745', fontWeight: 'bold' };
        if (upperStatus === 'ERROR' || upperStatus === 'BROKEN') return { color: '#dc3545', fontWeight: 'bold' };
        return { color: '#343a40', fontWeight: 'bold' };
    };

    return (
        <div>
            <div className="controls">
                <Button id="btn-task1" onClick={() => handleRunTask('Manual Dilution', 'Mixing Jobcard #123')} disabled={isTriggering}>
                    {isTriggering ? <Spinner as="span" animation="border" size="sm"/> : 'Run Manual Dilution'}
                </Button>
                <Button id="btn-task2" onClick={() => handleRunTask('Calibration', 'Running self-check sequence')} disabled={isTriggering}>
                    {isTriggering ? <Spinner as="span" animation="border" size="sm"/> : 'Run Calibration Task'}
                </Button>
            </div>
            
            {statusMessage && <Alert variant="info" className="text-center mt-3">{statusMessage}</Alert>}
            {error && <Alert variant="danger" className="text-center mt-3">{error}</Alert>}

            <h2 className="mt-4 text-center">Task History & Status</h2>
            <div id="log_table_container">
                <Table striped bordered hover responsive id="task_log_table">
                    <thead>
                        <tr>
                            <th rowSpan="2">ID</th><th rowSpan="2">Task Name</th><th rowSpan="2">Start Time</th>
                            <th colSpan="2" className="pi-header">Raspberry Pi (Physical)</th>
                            <th colSpan="2" className="unity-header">Unity (Virtual)</th>
                            <th rowSpan="2">Details</th>
                        </tr>
                        <tr>
                            <th className="pi-header">Status</th><th className="pi-header">Dur. (s)</th>
                            <th className="unity-header">Status</th><th className="unity-header">Dur. (s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log.log_id}>
                                <td>{log.log_id}</td><td>{log.task_name}</td><td>{log.start_time}</td>
                                <td style={getStatusStyle(log.pi_status)}>{log.pi_status}</td>
                                <td>{log.pi_duration_seconds ?? 'N/A'}</td>
                                <td style={getStatusStyle(log.unity_status)}>{log.unity_status}</td>
                                <td>{log.unity_duration_seconds ?? 'N/A'}</td>
                                <td className="text-start">{log.message || ''}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" className="text-center text-muted p-4">{error ? 'Could not load data.' : 'No task history found. Waiting for data...'}</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default RobotExecutionTab;