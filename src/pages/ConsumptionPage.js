import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Spinner } from 'react-bootstrap';
// FaEdit has been removed from the import below
import { FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import * as consumptionService from '../services/consumptionService';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function ConsumptionPage() {
    const [consumptionList, setConsumptionList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states for delete functionality
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    // Removed unused state: showModal, currentItem
    // Removed unused handler: handleEdit

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await consumptionService.getAllConsumptions();
            setConsumptionList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await consumptionService.deleteConsumption(itemToDelete.consumptionId);
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <Card className="shadow-sm border-light-subtle">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
                    <h2 className="mb-0">Overall Consumption Management</h2>
                    <Button className="btn-custom-primary" disabled title="Add feature coming soon">
                        Add Consumption Record
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
                                    <th>Item Name</th>
                                    <th>Quantity Used</th>
                                    <th>Jobcard ID</th>
                                    <th>Formula</th>
                                    <th>Consumption Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consumptionList.map(item => (
                                    <tr key={item.consumptionId}>
                                        <td>{item.consumptionId}</td>
                                        <td>{item.Inventory?.name || 'N/A'}</td>
                                        <td>{`${item.quantityUsed} ${item.Inventory?.unit || ''}`}</td>
                                        <td>{item.Jobcard?.jobcardId || 'N/A'}</td>
                                        <td>{item.Formula?.name || 'N/A'}</td>
                                        <td>{format(new Date(item.consumptionDate), 'dd/MM/yyyy HH:mm')}</td>
                                        <td>
                                            {/* The unused Edit button has been completely removed */}
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(item)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={`Consumption Record #${itemToDelete?.consumptionId}`}
            />
        </>
    );
}

export default ConsumptionPage;