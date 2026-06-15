import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import { FaHdd, FaTimes, FaExclamationTriangle, FaCircle } from 'react-icons/fa';

function HardwarePreviewModal({ show, handleClose, hardware }) {
    if (!hardware) return null;

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered className="um-modal">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #043873 0%, #0a4f9e 100%)', color: 'white' }}>
                <Modal.Title className="fw-bold">
                    <FaHdd className="me-2 text-warning" /> Diagnostics: {hardware.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                
                {/* Handshake Details Header */}
                <Card className="border-0 shadow-sm mb-4 rounded-4 p-3 bg-white border d-flex flex-row align-items-center justify-content-between">
                    <div>
                        <div className="small text-muted text-uppercase fw-bold">Active Handshake Endpoint</div>
                        <div className="fw-bold text-primary">{hardware.apiEndpoint || 'Not Configured'}</div>
                    </div>
                    <span className="custom-status-badge bg-status-active py-2">
                        <FaCircle className="me-2" size={10} /> Physical Ports: {hardware.availablePorts || 'N/A'}
                    </span>
                </Card>

                {/* Live 3D Simulation Frame / Warning */}
                <h5 className="text-primary fw-bold text-uppercase small mb-3">Live 3D WebGL Asset Preview</h5>
                {hardware.digitalTwinUrl ? (
                    <div className="webgl-viewer-container shadow rounded-4 overflow-hidden mb-0 border" style={{ height: '800px' }}>
                        <iframe 
                            id="webgl-viewer" 
                            src={hardware.digitalTwinUrl} 
                            title={`${hardware.name} WebGL Preview`}
                            allow="fullscreen"
                            sandbox="allow-scripts allow-same-origin"
                            style={{ width: '100%', height: '800px', border: 'none' }}
                        ></iframe>
                    </div>
                ) : (
                    <Card className="border-0 shadow-sm rounded-4 p-5 text-center mb-0 border-start border-4 border-danger" style={{ backgroundColor: '#fff5f5' }}>
                        <Card.Body className="py-4">
                            <FaExclamationTriangle size={48} className="text-danger mb-3" />
                            <h4 className="fw-bold text-danger">Digital Twin Asset Missing</h4>
                            <p className="text-muted mb-0 max-width-md mx-auto" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                                There is no WebGL simulation URL configured for <strong>{hardware.name}</strong>.<br />
                                Please edit this hardware's settings to upload the WebGL asset path.
                            </p>
                        </Card.Body>
                    </Card>
                )}

            </Modal.Body>
            <Modal.Footer className="bg-light border-0">
                <Button variant="outline-secondary" className="rounded-pill px-4" onClick={handleClose}>
                    <FaTimes className="me-2"/> Close Diagnostics
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default HardwarePreviewModal;