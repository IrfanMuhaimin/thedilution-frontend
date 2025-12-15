import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

function StockBatchModal({ show, handleClose, handleSave, batch }) {
    // --- NEW STATE VARIABLES for loading and errors ---
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({});
    const isEditMode = !!batch?.inventoryStockId;

    useEffect(() => {
        if (show) {
            setError(''); // Reset error each time the modal opens
            if (isEditMode) {
                // Populate form with data for editing an existing batch
                setFormData({
                    ...batch,
                    expired: batch.expired ? format(parseISO(batch.expired), 'yyyy-MM-dd') : ''
                });
            } else {
                // Reset form for adding a new batch
                setFormData({
                    quantity: '',
                    supplier: '',
                    batchNumber: '',
                    expired: ''
                });
            }
        }
    }, [batch, show, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- MODIFIED onSave function to be async and handle loading/error states ---
    const onSave = async () => {
        // Simple validation
        if (!formData.quantity || !formData.batchNumber) {
            setError('Quantity and Batch Number are required fields.');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const dataToSave = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                expired: formData.expired ? new Date(formData.expired).toISOString() : null,
            };
            // The handleSave function (from the parent) will perform the API call
            // and close the modal on success.
            await handleSave(dataToSave);

        } catch (err) {
            // If handleSave throws an error, we catch it here and display it.
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            // This runs whether the save succeeded or failed.
            setIsSaving(false);
        }
    };

    return (
        // Added backdrop and keyboard props to prevent closing while saving
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Stock Batch' : 'Add New Stock Batch'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Display an error message if one exists */}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control required type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Supplier</Form.Label>
                                <Form.Control type="text" name="supplier" value={formData.supplier || ''} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Batch Number</Form.Label>
                                <Form.Control required type="text" name="batchNumber" value={formData.batchNumber || ''} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Expiry Date</Form.Label>
                                <Form.Control type="date" name="expired" value={formData.expired || ''} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
                    Close
                </Button>
                
                {/* --- MODIFIED SAVE BUTTON with loading state --- */}
                <Button className="btn-custom-primary" onClick={onSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Saving...</span>
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default StockBatchModal;