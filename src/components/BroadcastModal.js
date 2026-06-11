import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaBullhorn, FaUsers, FaExclamationTriangle, FaPaperPlane } from 'react-icons/fa';

function BroadcastModal({ show, handleClose, onBroadcast }) {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [targetRole, setTargetRole] = useState('All');
    const [severity, setSeverity] = useState('info');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onBroadcast({ topic, description, targetRole, severity });
            handleClose();
            setTopic(''); setDescription(''); setTargetRole('All'); setSeverity('info');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title><FaBullhorn className="me-2 text-warning" /> Broadcast System Announcement</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4 bg-light">
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-primary">ANNOUNCEMENT TOPIC (TITLE)</Form.Label>
                        <Form.Control type="text" required value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Scheduled System Maintenance" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-primary">DESCRIPTION / MESSAGE</Form.Label>
                        <Form.Control as="textarea" rows={4} required value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter details here..." />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-primary"><FaUsers className="me-2"/>TARGET AUDIENCE GROUP</Form.Label>
                        <Form.Select value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                            <option value="All">Everyone (All Active Accounts)</option>
                            <option value="Doctor">Doctors Only</option>
                            <option value="Pharmacist">Pharmacists Only</option>
                            <option value="Admin">Admins Only</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-primary"><FaExclamationTriangle className="me-2"/>SEVERITY LEVEL</Form.Label>
                        <Form.Select value={severity} onChange={e => setSeverity(e.target.value)}>
                            <option value="info">Info (Blue Badge)</option>
                            <option value="warning">Warning (Yellow Badge)</option>
                            <option value="high">Urgent/High (Red Badge)</option>
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="bg-white border-0">
                    <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleClose}>Cancel</Button>
                    <Button className="btn-custom-primary rounded-pill px-4" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : <><FaPaperPlane className="me-2"/> Broadcast Announcement</>}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default BroadcastModal;