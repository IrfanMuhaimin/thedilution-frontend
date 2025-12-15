import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaBoxes } from 'react-icons/fa';
//import { format } from 'date-fns';
import * as inventoryService from '../services/inventoryService';
import AddInventoryMasterModal from '../components/AddInventoryMasterModal';
import EditInventoryMasterModal from '../components/EditInventoryMasterModal';
import ManageStockModal from '../components/ManageStockModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function InventoryPage() {
    const [inventoryList, setInventoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showAddMasterModal, setShowAddMasterModal] = useState(false);
    const [showEditMasterModal, setShowEditMasterModal] = useState(false);
    const [showManageStockModal, setShowManageStockModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Data for modals
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // <-- ADD THIS STATE for master delete loading

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await inventoryService.getAllInventory();
            setInventoryList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    useEffect(() => {
        if (showManageStockModal && selectedItem) {
            const updatedItem = inventoryList.find(item => item.inventoryId === selectedItem.inventoryId);
            setSelectedItem(updatedItem);
        }
    }, [inventoryList, selectedItem, showManageStockModal]);

    const handleEditMaster = (item) => {
        setSelectedItem(item);
        setShowEditMasterModal(true);
    };

    const handleManageStock = (item) => {
        setSelectedItem(item);
        setShowManageStockModal(true);
    };

    const handleDeleteMaster = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleSaveMaster = async (itemData, isEditing = false) => {
        try {
            if (isEditing) {
                await inventoryService.updateInventoryMaster(selectedItem.inventoryId, itemData);
                setShowEditMasterModal(false);
            } else {
                await inventoryService.addInventoryMaster(itemData);
                setShowAddMasterModal(false);
            }
            fetchInventory();
        } catch (err) {
            alert(err.message);
        }
    };

    // --- MODIFIED: Added loading state logic for master delete ---
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true); // Start loading
        try {
            await inventoryService.deleteInventoryMaster(itemToDelete.inventoryId);
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchInventory();
        } catch (err) {
            setError(err.message);
            setShowDeleteModal(false); // Close modal even on error
        } finally {
            setIsDeleting(false); // Stop loading in all cases
        }
    };

    const getStatusFromPrediction = (days) => {
        if (days === null || typeof days === 'undefined') return { variant: 'secondary', text: 'Unknown' };
        if (days <= 0) return { variant: 'danger', text: 'Out of Stock' };
        if (days <= 3) return { variant: 'warning', text: 'Running Out' };
        return { variant: 'success', text: 'Available' };
    };

    return (
        <>
            <Card className="shadow-sm border-light-subtle">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
                    <h2 className="mb-0">Inventory Master List</h2>
                    <Button className="btn-custom-primary" onClick={() => setShowAddMasterModal(true)}>
                        <FaPlus className="me-2" /> Add New Master Item
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" /></div>
                    ) : (
                        <Table striped hover responsive>
                            <thead>
                                <tr className="fw-bold">
                                    <th>ID</th><th>Name</th><th>Hardware Port</th><th>Total Quantity</th>
                                    <th>Predicted Stock Out</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryList.map(item => {
                                    const status = getStatusFromPrediction(item.predictedStockingDays);
                                    return (
                                        <tr key={item.inventoryId}>
                                            <td>{item.inventoryId}</td><td>{item.name}</td>
                                            <td><Badge bg="info">{item.hardwarePort || 'N/A'}</Badge></td>
                                            <td>{`${item.quantity} ${item.unit}`}</td>
                                            <td>
                                                {item.predictedStockingDays !== null && typeof item.predictedStockingDays !== 'undefined'
                                                    ? `${item.predictedStockingDays.toFixed(1)} days`
                                                    : 'N/A'}
                                            </td>
                                            <td><Badge bg={status.variant}>{status.text}</Badge></td>
                                            <td>
                                                <Button variant="info" size="sm" className="me-2" onClick={() => handleManageStock(item)} title="Manage Batches"><FaBoxes /></Button>
                                                <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEditMaster(item)} title="Edit Master Item"><FaEdit /></Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteMaster(item)} title="Delete Master Item"><FaTrash /></Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <AddInventoryMasterModal show={showAddMasterModal} handleClose={() => setShowAddMasterModal(false)} handleSave={(data) => handleSaveMaster(data, false)} />

            {selectedItem && (
                <EditInventoryMasterModal show={showEditMasterModal} handleClose={() => setShowEditMasterModal(false)} handleSave={(data) => handleSaveMaster(data, true)} item={selectedItem} />
            )}

            {selectedItem && (
                <ManageStockModal show={showManageStockModal} handleClose={() => setShowManageStockModal(false)} inventoryItem={selectedItem} refreshData={fetchInventory} />
            )}

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={itemToDelete?.name}
                isDeleting={isDeleting} // <-- Pass the loading state to the modal
            />
        </>
    );
}

export default InventoryPage;