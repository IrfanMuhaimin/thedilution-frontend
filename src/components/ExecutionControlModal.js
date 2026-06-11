import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaRobot, FaExclamationTriangle, FaCheckCircle, FaLock } from 'react-icons/fa';

function ExecutionControlModal({ show, handleClose, onConfirm, jobcard, isDoubleExecution }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onConfirm(password);
            handleClose();
            setPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className={isDoubleExecution ? "bg-warning" : "bg-primary text-white"}>
                <Modal.Title>
                    {isDoubleExecution ? <FaExclamationTriangle className="me-2"/> : <FaRobot className="me-2"/>}
                    {isDoubleExecution ? "Re-execution Warning" : "Ready to Execute"}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {isDoubleExecution ? (
                        <Alert variant="warning">
                            <strong>Warning:</strong> This Jobcard was already executed on {jobcard.executionDate}. 
                            Re-executing will deduct <strong>additional inventory</strong>.
                        </Alert>
                    ) : (
                        <p>Are you sure you want to send Jobcard <strong>#{jobcard?.jobcardId}</strong> to the mixing unit?</p>
                    )}

                    {isDoubleExecution && (
                        <Form.Group className="mt-3">
                            <Form.Label><FaLock className="me-2"/>Confirm Account Password to Proceed</Form.Label>
                            <Form.Control 
                                type="password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Enter password"
                            />
                        </Form.Group>
                    )}
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button variant={isDoubleExecution ? "warning" : "success"} type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm"/> : "Confirm & Send to Machine"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ExecutionControlModal;