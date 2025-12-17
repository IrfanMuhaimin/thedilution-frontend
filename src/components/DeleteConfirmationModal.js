import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { FaExclamationTriangle, FaTimes, FaTrash } from 'react-icons/fa';
import '../styles/UserManagement.css';

function DeleteConfirmationModal({ show, handleClose, handleConfirm, userName, isDeleting }) {
    return (
        <Modal 
            show={show} 
            onHide={isDeleting ? () => {} : handleClose} 
            backdrop={isDeleting ? 'static' : true} 
            keyboard={!isDeleting}
            className="um-delete-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaExclamationTriangle className="me-2" />
                    Confirm Deletion
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="um-delete-icon">
                    <FaTrash />
                </div>
                <h4 style={{ 
                    fontWeight: 600, 
                    color: '#1e293b', 
                    marginBottom: '0.75rem' 
                }}>
                    Delete User?
                </h4>
                <p style={{ 
                    color: '#64748b', 
                    marginBottom: '1rem',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6
                }}>
                    Are you sure you want to delete <strong style={{ color: '#ef4444' }}>{userName}</strong>?
                </p>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#ef4444'
                }}>
                    <FaExclamationTriangle style={{ flexShrink: 0 }} />
                    <span>This action cannot be undone. All user data will be permanently removed.</span>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    className="um-btn-cancel" 
                    onClick={handleClose} 
                    disabled={isDeleting}
                    style={{
                        background: 'transparent',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        fontWeight: 600,
                        color: '#64748b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.25s ease'
                    }}
                >
                    <FaTimes />
                    Cancel
                </Button>
                <Button 
                    className="um-btn-confirm-delete" 
                    onClick={handleConfirm} 
                    disabled={isDeleting}
                    style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.25s ease'
                    }}
                >
                    {isDeleting ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span>Deleting...</span>
                        </>
                    ) : (
                        <>
                            <FaTrash />
                            Delete User
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteConfirmationModal;