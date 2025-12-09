import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import * as drugService from '../../services/drugService';
import DilutionModal from '../DilutionModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function DilutionTab() {
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
            const data = await drugService.getAllDilutions();
            setList(data);
        } catch (err) {
            setError(err.message);
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
            if (currentItem && currentItem.dilutionId) {
                await drugService.updateDilution(currentItem.dilutionId, itemData);
            } else {
                await drugService.addDilution(itemData);
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await drugService.deleteDilution(itemToDelete.dilutionId);
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };
    
    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button className="btn-custom-primary" onClick={handleAdd}><FaPlus className="me-2" /> Add Dilution</Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
                <div className="text-center py-5"><Spinner animation="border" /></div>
            ) : (
                <Table striped hover responsive>
                    <thead>
                        <tr className="fw-bold">
                            <th>ID</th>
                            <th>Name</th>
                            <th>Purpose</th>
                            <th>Formula Used</th>
                            <th>Last Modified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(item => (
                            <tr key={item.dilutionId}>
                                <td>{item.dilutionId}</td>
                                <td>{item.name}</td>
                                <td>{item.purpose}</td>
                                <td>{item.Formula?.name || 'N/A'}</td>
                                <td>{format(new Date(item.modifyDate), 'dd/MM/yyyy HH:mm')}</td>
                                <td>
                                    <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEdit(item)}><FaEdit /></Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(item)}><FaTrash /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <DilutionModal show={showModal} handleClose={() => setShowModal(false)} handleSave={handleSave} item={currentItem} />
            <DeleteConfirmationModal show={showDeleteModal} handleClose={() => setShowDeleteModal(false)} handleConfirm={handleConfirmDelete} userName={itemToDelete?.name} />
        </>
    );
}

export default DilutionTab;