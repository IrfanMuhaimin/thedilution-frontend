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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [batchToDelete, setBatchToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAddBatch = () => {
        setCurrentBatch(null);
        setShowBatchModal(true);
    };

    const handleEditBatch = (batch) => {
        setCurrentBatch(batch);
        setShowBatchModal(true);
    };

    const handleDeleteBatch = (batch) => {
        setBatchToDelete(batch);
        setShowDeleteModal(true);
    };
    
    const handleConfirmDeleteBatch = async () => {
        if (!batchToDelete) return;
        setIsDeleting(true);
        setError('');
        try {
            await inventoryService.deleteStockBatch(batchToDelete.inventoryStockId);
            setShowDeleteModal(false);
            await refreshData();
        } catch (err) {
            setError(err.message);
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
            setBatchToDelete(null);
        }
    };

    const handleSaveBatch = async (batchData) => {
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

            <StockBatchModal show={showBatchModal} handleClose={() => setShowBatchModal(false)} handleSave={handleSaveBatch} batch={currentBatch} />

            <DeleteConfirmationModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDeleteBatch}
                userName={`Batch #${batchToDelete?.batchNumber}`}
                isDeleting={isDeleting}
            />
        </>
    );
}

export default ManageStockModal;