import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaBoxes } from 'react-icons/fa';
import { format } from 'date-fns';
import * as inventoryService from '../services/inventoryService';
import AddInventoryMasterModal from '../components/AddInventoryMasterModal';
import ManageStockModal from '../components/ManageStockModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function InventoryPage() {
    const [inventoryList, setInventoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddMasterModal, setShowAddMasterModal] = useState(false);
    const [showManageStockModal, setShowManageStockModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

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
        if (selectedItem) {
            const updatedSelectedItem = inventoryList.find(
                item => item.inventoryId === selectedItem.inventoryId
            );
            // Check for deep equality could be complex, so a simple check is often enough
            // This prevents a minor re-render but the main infinite loop is already solved
            if (JSON.stringify(updatedSelectedItem) !== JSON.stringify(selectedItem)) {
                setSelectedItem(updatedSelectedItem);
            }
        }
    }, [inventoryList, selectedItem]);

    const handleManageStock = (item) => {
        setSelectedItem(item);
        setShowManageStockModal(true);
    };

    const handleDeleteMaster = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleSaveMaster = async (itemData) => {
        try {
            await inventoryService.addInventoryMaster(itemData);
            setShowAddMasterModal(false);
            await fetchInventory(); // Await the fetch
        } catch (err) {
            alert(err.message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await inventoryService.deleteInventoryMaster(itemToDelete.inventoryId);
            setShowDeleteModal(false);
            setItemToDelete(null);
            await fetchInventory(); // Await the fetch
        } catch (err) {
            setError(err.message);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Available': return 'success';
            case 'Low Stock': return 'warning';
            case 'Out of Stock': return 'danger';
            default: return 'secondary';
        }
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
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Total Quantity</th>
                                    <th>Status</th>
                                    <th>Last Updated By</th>
                                    <th>Last Update</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryList.map(item => (
                                    <tr key={item.inventoryId}>
                                        <td>{item.inventoryId}</td>
                                        <td>{item.name}</td>
                                        <td>{`${item.quantity} ${item.unit}`}</td>
                                        <td><Badge bg={getStatusBadge(item.status)}>{item.status}</Badge></td>
                                        <td>{item.User?.username || 'N/A'}</td>
                                        <td>{item.updateDate ? format(new Date(item.updateDate), 'dd/MM/yyyy') : 'N/A'}</td>
                                        <td>
                                            <Button variant="info" size="sm" className="me-2" onClick={() => handleManageStock(item)} title="Manage Stock">
                                                <FaBoxes />
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteMaster(item)} title="Delete Master Item">
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <AddInventoryMasterModal
                show={showAddMasterModal}
                handleClose={() => setShowAddMasterModal(false)}
                handleSave={handleSaveMaster}
            />

            {selectedItem && (
                <ManageStockModal
                    show={showManageStockModal}
                    handleClose={() => setShowManageStockModal(false)}
                    inventoryItem={selectedItem}
                    refreshData={fetchInventory}
                />
            )}

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={itemToDelete?.name}
            />
        </>
    );
}

export default InventoryPage;