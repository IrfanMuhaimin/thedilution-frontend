import React, { useState } from 'react';
import { Modal, Button, Table, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import * as inventoryService from '../services/inventoryService';
import StockBatchModal from './StockBatchModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

function ManageStockModal({ show, handleClose, inventoryItem, refreshData }) {
    const [error, setError] = useState('');
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [currentBatch, setCurrentBatch] = useState(null);

    // --- State specifically for the delete confirmation ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // <-- ADD THIS STATE for batch delete loading

    const handleAddBatch = () => {
        setCurrentBatch(null);
        setShowBatchModal(true);
    };

    const handleEditBatch = (batch) => {
        setCurrentBatch(batch);
        setShowBatchModal(true);
    };

    // This function just opens the confirmation modal
    const handleDeleteBatch = (batch) => {
        setBatchToDelete(batch);
        setShowDeleteModal(true);
    };
    
    // --- MODIFIED: This new function handles the actual deletion with loading state ---
    const handleConfirmDeleteBatch = async () => {
        if (!batchToDelete) return;
        setIsDeleting(true); // Start loading
        setError('');
        try {
            await inventoryService.deleteStockBatch(batchToDelete.inventoryStockId);
            setShowDeleteModal(false);
            await refreshData(); // Refresh the data in the background
        } catch (err) {
            setError(err.message); // Show error inside the ManageStockModal
            setShowDeleteModal(false); // Still close the confirmation modal
        } finally {
            setIsDeleting(false); // Stop loading
            setBatchToDelete(null);
        }
    };

    const handleSaveBatch = async (batchData) => {
        // This function now throws errors to be caught by the StockBatchModal
        if (currentBatch?.inventoryStockId) {
            await inventoryService.updateStockBatch(currentBatch.inventoryStockId, batchData);
        } else {
            await inventoryService.addStockBatch(inventoryItem.inventoryId, batchData);
        }
        await refreshData();
        setShowBatchModal(false);
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Manage Stock for: {inventoryItem?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-end mb-3">
                        <Button className="btn-custom-primary" onClick={handleAddBatch}><FaPlus className="me-2" /> Add New Batch</Button>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr className="fw-bold">
                                <th>Batch Number</th><th>Supplier</th><th>Quantity</th>
                                <th>Expiry Date</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItem?.InventoryStocks?.length > 0 ? (
                                inventoryItem.InventoryStocks.map(batch => (
                                    <tr key={batch.inventoryStockId}>
                                        <td>{batch.batchNumber}</td><td>{batch.supplier}</td><td>{batch.quantity}</td>
                                        <td>{batch.expired ? format(new Date(batch.expired), 'dd/MM/yyyy') : 'N/A'}</td>
                                        <td>
                                            <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEditBatch(batch)}><FaEdit /></Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteBatch(batch)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))
                            ) : ( <tr><td colSpan="5" className="text-center">No stock batches found.</td></tr> )}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            {/* The StockBatchModal now handles its own save/loading state */}
            <StockBatchModal show={showBatchModal} handleClose={() => setShowBatchModal(false)} handleSave={handleSaveBatch} batch={currentBatch} />

            {/* This DeleteConfirmationModal is now controlled by this component's state */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDeleteBatch}
                userName={`Batch #${batchToDelete?.batchNumber}`}
                isDeleting={isDeleting} // <-- Pass the loading state here
            />
        </>
    );
}

export default ManageStockModal;