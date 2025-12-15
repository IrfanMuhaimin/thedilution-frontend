import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

function DeleteConfirmationModal({ show, handleClose, handleConfirm, userName, isDeleting }) {
    return (
        <Modal show={show} onHide={isDeleting ? () => {} : handleClose} backdrop={isDeleting ? 'static' : true} keyboard={!isDeleting}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete: <strong>{userName}</strong>? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleConfirm} disabled={isDeleting}>
                    {isDeleting ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Deleting...</span>
                        </>
                    ) : (
                        'Delete'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DeleteConfirmationModal;