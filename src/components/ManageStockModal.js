import React, { useState } from 'react';
import { Modal, Button, Table, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import * as inventoryService from '../services/inventoryService';
import StockBatchModal from './StockBatchModal';

function ManageStockModal({ show, handleClose, inventoryItem, refreshData }) {
    const [error, setError] = useState('');
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [currentBatch, setCurrentBatch] = useState(null);

    const handleAddBatch = () => {
        setCurrentBatch(null);
        setShowBatchModal(true);
    };

    const handleEditBatch = (batch) => {
        setCurrentBatch(batch);
        setShowBatchModal(true);
    };

    const handleDeleteBatch = async (batchId) => {
        if (window.confirm('Are you sure you want to delete this stock batch?')) {
            try {
                setError('');
                await inventoryService.deleteStockBatch(batchId);
                await refreshData(); // Await the refresh before continuing
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleSaveBatch = async (batchData) => {
        try {
            setError('');

            if (currentBatch?.inventoryStockId) { // Editing
                await inventoryService.updateStockBatch(currentBatch.inventoryStockId, batchData);
            } else { // Adding
                await inventoryService.addStockBatch(inventoryItem.inventoryId, batchData);
            }
            
            await refreshData(); // Await the refresh to get the latest data
            setShowBatchModal(false); // Close modal only after data is fresh

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Manage Stock for: {inventoryItem?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-end mb-3">
                        <Button className="btn-custom-primary" onClick={handleAddBatch}>
                            <FaPlus className="me-2" /> Add New Batch
                        </Button>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr className="fw-bold">
                                <th>Batch Number</th>
                                <th>Supplier</th>
                                <th>Quantity</th>
                                <th>Expiry Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItem?.InventoryStocks?.length > 0 ? (
                                inventoryItem.InventoryStocks.map(batch => (
                                    <tr key={batch.inventoryStockId}>
                                        <td>{batch.batchNumber}</td>
                                        <td>{batch.supplier}</td>
                                        <td>{batch.quantity}</td>
                                        <td>{batch.expired ? format(new Date(batch.expired), 'dd/MM/yyyy') : 'N/A'}</td>
                                        <td>
                                            <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEditBatch(batch)}><FaEdit /></Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteBatch(batch.inventoryStockId)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center">No stock batches found.</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>

            <StockBatchModal
                show={showBatchModal}
                handleClose={() => setShowBatchModal(false)}
                handleSave={handleSaveBatch}
                batch={currentBatch}
            />
        </>
    );
}

export default ManageStockModal;