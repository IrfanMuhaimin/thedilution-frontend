import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { FaExclamationTriangle, FaTimes, FaTrash, FaArchive } from 'react-icons/fa';

function DeleteConfirmationModal({ 
    show, 
    handleClose, 
    handleConfirm, 
    itemName,               // The specific name (e.g., "Robotic Arm Alpha")
    entityName = "Item",    // What it is (e.g., "Hardware", "User")
    actionType = "Delete",  // "Archive" or "Delete"
    isProcessing = false    // Loading state
}) {
    // Dynamic text logic based on actionType
    const isArchive = actionType === 'Archive';
    const ActionIcon = isArchive ? FaArchive : FaTrash;
    const darkRed = '#750000';
    const darkerRed = '#520000';

    return (
        <Modal 
            show={show} 
            onHide={isProcessing ? () => {} : handleClose} 
            backdrop={isProcessing ? 'static' : true} 
            keyboard={!isProcessing}
            centered
        >
            <Modal.Header closeButton style={{ background: `linear-gradient(135deg, ${darkRed} 0%, ${darkerRed} 100%)`, border: 'none' }}>
                <Modal.Title className="text-white fw-bold">
                    <FaExclamationTriangle className="me-2" />
                    Confirm {isArchive ? 'Archiving' : 'Deletion'}
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="text-center p-4">
                <div style={{
                    width: '64px', height: '64px',
                    background: 'rgba(117, 0, 0, 0.1)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    fontSize: '1.75rem',
                    color: darkRed
                }}>
                    <ActionIcon />
                </div>
                
                <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                    {actionType} {entityName}?
                </h4>
                
                <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '1rem', lineHeight: 1.6 }}>
                    Are you sure you want to {actionType.toLowerCase()} <strong style={{ color: darkRed }}>{itemName}</strong>?
                </p>
                
                <div style={{
                    background: 'rgba(117, 0, 0, 0.05)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    border: `1px solid rgba(117, 0, 0, 0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    color: darkRed,
                    textAlign: 'left'
                }}>
                    <FaExclamationTriangle style={{ flexShrink: 0, fontSize: '1.1rem' }} />
                    <span>
                        {isArchive 
                            ? `This ${entityName.toLowerCase()} will be moved to the archive. It will no longer appear in active lists but can be restored later.` 
                            : "This action cannot be undone. All associated data will be permanently removed from the database."}
                    </span>
                </div>
            </Modal.Body>
            
            <Modal.Footer className="justify-content-center border-0 pb-4">
                <Button 
                    onClick={handleClose} 
                    disabled={isProcessing}
                    style={{
                        background: 'transparent',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        fontWeight: 600,
                        color: '#64748b',
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <FaTimes /> Cancel
                </Button>
                
                <Button 
                    onClick={handleConfirm} 
                    disabled={isProcessing}
                    style={{
                        background: `linear-gradient(135deg, ${darkRed} 0%, ${darkerRed} 100%)`,
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        transition: 'all 0.2s ease',
                        boxShadow: `0 4px 12px rgba(117, 0, 0, 0.3)`
                    }}
                >
                    {isProcessing ? (
                        <><Spinner as="span" animation="border" size="sm" /> Processing...</>
                    ) : (
                        <><ActionIcon /> {actionType} {entityName}</>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteConfirmationModal;