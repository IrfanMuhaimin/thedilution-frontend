import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaArchive, FaBoxes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as inventoryService from '../services/inventoryService';
import AddInventoryMasterModal from '../components/AddInventoryMasterModal';
import EditInventoryMasterModal from '../components/EditInventoryMasterModal';
import ManageStockModal from '../components/ManageStockModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function InventoryPage() {
    const navigate = useNavigate();
    const [inventoryList, setInventoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddMasterModal, setShowAddMasterModal] = useState(false);
    const [showEditMasterModal, setShowEditMasterModal] = useState(false);
    const [showManageStockModal, setShowManageStockModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemToArchive, setItemToArchive] = useState(null);
    const [isArchiving, setIsArchiving] = useState(false);

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true); setError('');
            const data = await inventoryService.getAllInventory();
            setInventoryList(data);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    useEffect(() => {
        if (showManageStockModal && selectedItem) {
            const updatedItem = inventoryList.find(item => item.inventoryId === selectedItem.inventoryId);
            setSelectedItem(updatedItem);
        }
    }, [inventoryList, selectedItem, showManageStockModal]);

    const handleEditMaster = (item) => { setSelectedItem(item); setShowEditMasterModal(true); };
    const handleManageStock = (item) => { setSelectedItem(item); setShowManageStockModal(true); };
    const handleArchiveMasterClick = (item) => { setItemToArchive(item); setShowArchiveModal(true); };

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
        } catch (err) { alert(err.message); }
    };

    const handleConfirmArchive = async () => {
        if (!itemToArchive) return;
        setIsArchiving(true);
        try {
            await inventoryService.deleteInventoryMaster(itemToArchive.inventoryId);
            setShowArchiveModal(false);
            setItemToArchive(null);
            fetchInventory();
        } catch (err) { setError(err.message); setShowArchiveModal(false); } 
        finally { setIsArchiving(false); }
    };

    // --- NEW: Custom Pill Status Logic ---
    const getInventoryStatusClass = (days) => {
        if (days === null || typeof days === 'undefined') return { css: 'bg-status-unknown', text: 'Unknown' };
        if (days <= 0) return { css: 'bg-status-outofstock', text: 'Out of Stock' };
        if (days <= 5) return { css: 'bg-status-runningout', text: 'Running Out' };
        return { css: 'bg-status-available', text: 'Available' };
    };

    return (
        <>
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3 border-0">
                    <h2 className="mb-0 text-primary fw-bold">Inventory Master List</h2>
                    <Button className="btn-custom-primary rounded-pill px-4 shadow-sm" onClick={() => setShowAddMasterModal(true)}>
                        <FaPlus className="me-2" /> Add New Master Item
                    </Button>
                </Card.Header>
                <Card.Body className="p-4 bg-light">
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div> : (
                        <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                            <Table hover responsive className="align-middle mb-0">
                            <thead className="table-light text-muted small text-uppercase">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Name</th>
                                    <th>Hardware & Port</th>
                                    <th>Total Quantity</th>
                                    <th>Predicted Stock Out</th>
                                    <th>Status</th>
                                    <th className="text-center pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryList.length > 0 ? inventoryList.map(item => {
                                    const status = getInventoryStatusClass(item.predictedStockingDays);
                                    return (
                                        <tr key={item.inventoryId}>
                                            <td className="ps-4 text-muted fw-bold">#{item.inventoryId}</td>
                                            <td className="entity-name-dark-blue">{item.name}</td>
                                            <td>
                                                {/* --- NEW: Hardware Port Styling --- */}
                                                <div className="d-flex flex-column align-items-start">
                                                    <span className="fw-bold text-dark mb-1" style={{ fontSize: '0.85rem' }}>{item.Hardware?.name || 'Unassigned'}</span>
                                                    <span className="badge-hardware-port">PORT {item.hardwarePort || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="fw-bold">{`${item.quantity} ${item.unit}`}</td>
                                            <td className="text-muted">
                                                {item.predictedStockingDays !== null && typeof item.predictedStockingDays !== 'undefined' ? `${item.predictedStockingDays.toFixed(1)} days` : 'N/A'}
                                            </td>
                                            <td>
                                                {/* --- NEW: Status Pill Styling --- */}
                                                <span className={`custom-status-badge ${status.css}`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="text-center pe-4">
                                                <div className="d-flex justify-content-center gap-2">
                                                    <button className="btn-table-action" onClick={() => handleManageStock(item)} title="Manage Batches">
                                                        <FaBoxes />
                                                    </button>
                                                    <button className="btn-table-action" onClick={() => handleEditMaster(item)} title="Edit Master Item">
                                                        <FaEdit />
                                                    </button>
                                                    <button className="btn-table-action" onClick={() => handleArchiveMasterClick(item)} title="Archive Master Item">
                                                        <FaArchive />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : <tr><td colSpan="7" className="text-center text-muted p-4">No active inventory found.</td></tr>}
                            </tbody>
                        </Table>
                        </div>
                    )}

                    {!loading && (
                        <div className="d-flex justify-content-center mt-4">
                            <Button variant="light" className="archive-bottom-btn shadow-sm" onClick={() => navigate('/inventory/archive')}>
                                <FaArchive className="me-2 text-muted" /> <span className="fw-bold text-muted">View Archived Inventory</span>
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <AddInventoryMasterModal show={showAddMasterModal} handleClose={() => setShowAddMasterModal(false)} handleSave={(data) => handleSaveMaster(data, false)} />
            {selectedItem && <EditInventoryMasterModal show={showEditMasterModal} handleClose={() => setShowEditMasterModal(false)} handleSave={(data) => handleSaveMaster(data, true)} item={selectedItem} />}
            {selectedItem && <ManageStockModal show={showManageStockModal} handleClose={() => setShowManageStockModal(false)} inventoryItem={selectedItem} refreshData={fetchInventory} />}
            <DeleteConfirmationModal 
                show={showArchiveModal} handleClose={() => setShowArchiveModal(false)} handleConfirm={handleConfirmArchive} 
                itemName={itemToArchive?.name} 
                entityName="Inventory Item" 
                actionType="Archive" 
                isProcessing={isArchiving} 
            />
        </>
    );
}

export default InventoryPage;