import React, {useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';
import * as drugService from '../../services/drugService';
import FormulaModal from '../FormulaModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function FormulaTab() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await drugService.getAllFormulas();
            if (Array.isArray(data)) {
                setList(data);
            } else {
                console.error("API returned unexpected format:", data);
                setList([]); 
                setError("Received invalid data format from server.");
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError(err.message || "An error occurred while fetching formulas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setCurrentItem(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setShowModal(true);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleSave = async (itemData) => {
        try {
            if (currentItem && currentItem.formulaId) {
                await drugService.updateFormula(currentItem.formulaId, itemData);
            } else {
                await drugService.addFormula(itemData);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert(err.message); // Simple alert for save errors
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await drugService.deleteFormula(itemToDelete.formulaId);
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button className="btn-custom-primary" onClick={handleAdd}>
                    <FaPlus className="me-2" /> Add Formula
                </Button>
            </div>

            {error && (
                <Alert variant="danger">
                    <FaExclamationTriangle className="me-2" />
                    {error}
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : (
                <Table striped hover responsive>
                    <thead>
                        <tr className="fw-bold">
                            <th>ID</th>
                            <th>Name</th>
                            <th>Creation Date</th>
                            <th>Ingredients</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 && !error && (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">No formulas found.</td>
                            </tr>
                        )}
                        {list.map(item => (
                            <tr key={item.formulaId}>
                                <td>{item.formulaId}</td>
                                <td>{item.name}</td>
                                <td>
                                    {item.creationDate 
                                        ? format(new Date(item.creationDate), 'dd/MM/yyyy') 
                                        : '-'}
                                </td>
                                <td>
                                    {item.FormulaDetails && item.FormulaDetails.length > 0 ? (
                                        item.FormulaDetails.map((detail, idx) => (
                                            <Badge pill bg="secondary" className="me-1 mb-1" key={`${item.formulaId}-${idx}`}>
                                                {detail.Inventory?.name || 'Unknown Item'} ({detail.requiredQuantity} {detail.Inventory?.unit || ''})
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted small">No ingredients</span>
                                    )}
                                </td>
                                <td>
                                    <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEdit(item)}>
                                        <FaEdit />
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(item)}>
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <FormulaModal 
                show={showModal} 
                handleClose={() => setShowModal(false)} 
                handleSave={handleSave} 
                item={currentItem} 
            />
            
            <DeleteConfirmationModal 
                show={showDeleteModal} 
                handleClose={() => setShowDeleteModal(false)} 
                handleConfirm={handleConfirmDelete} 
                userName={itemToDelete?.name} 
            />
        </>
    );
}

export default FormulaTab;