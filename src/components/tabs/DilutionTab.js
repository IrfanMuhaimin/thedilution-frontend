import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaArchive } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // NEW
import * as drugService from '../../services/drugService';
import DilutionModal from '../DilutionModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function DilutionTab() {
    const navigate = useNavigate(); // NEW
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToArchive, setItemToArchive] = useState(null);
    const [isArchiving, setIsArchiving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true); setError('');
            const data = await drugService.getAllDilutions();
            setList(data);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = () => { setCurrentItem(null); setShowModal(true); };
    const handleEdit = (item) => { setCurrentItem(item); setShowModal(true); };
    const handleArchiveClick = (item) => { setItemToArchive(item); setShowArchiveModal(true); };

    const handleSave = async (itemData) => {
        try {
            if (currentItem && currentItem.dilutionId) await drugService.updateDilution(currentItem.dilutionId, itemData);
            else await drugService.addDilution(itemData);
            setShowModal(false);
            fetchData();
        } catch (err) { setError(err.message); }
    };

    const handleConfirmArchive = async () => {
        if (!itemToArchive) return;
        setIsArchiving(true);
        try {
            await drugService.deleteDilution(itemToArchive.dilutionId);
            setShowArchiveModal(false);
            setItemToArchive(null);
            fetchData();
        } catch (err) { setError(err.message); }
        finally { setIsArchiving(false); }
    };
    
    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button className="btn-custom-primary rounded-pill shadow-sm" onClick={handleAdd}>
                    <FaPlus className="me-2" /> Add Dilution
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div> : (
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                    <Table hover responsive className="align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr><th>ID</th><th>Name</th><th>Purpose</th><th>Formula Linked</th><th>Last Modified</th><th className="text-center">Actions</th></tr>
                        </thead>
                        <tbody>
                            {list.length === 0 ? <tr><td colSpan="6" className="text-center text-muted p-4">No active dilutions found.</td></tr> : list.map(item => (
                                <tr key={item.dilutionId}>
                                    <td><Badge bg="light" text="dark" className="border">#{item.dilutionId}</Badge></td>
                                    <td className="entity-name-dark-blue">{item.name}</td>
                                    <td className="text-muted small">{item.purpose}</td>
                                    <td><Badge bg="dark" className="px-2 py-1">{item.Formula?.name || 'N/A'}</Badge></td>
                                    <td className="small text-muted">{format(new Date(item.modifyDate), 'dd/MM/yyyy HH:mm')}</td>
                                    <td className="text-center pe-4">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="btn-table-action" onClick={() => handleEdit(item)} title="Edit Item">
                                                <FaEdit />
                                            </button>
                                            <button className="btn-table-action" onClick={() => handleArchiveClick(item)} title="Archive Item">
                                                <FaArchive />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            )}

            {!loading && (
                <div className="d-flex justify-content-center mt-4 mb-2">
                    <Button variant="light" className="archive-bottom-btn shadow-sm" onClick={() => navigate('/drugs/archive')}>
                        <FaArchive className="me-2 text-muted" /> <span className="fw-bold text-muted">View Archived Drugs</span>
                    </Button>
                </div>
            )}

            <DilutionModal show={showModal} handleClose={() => setShowModal(false)} handleSave={handleSave} item={currentItem} />
            <DeleteConfirmationModal 
                show={showArchiveModal} handleClose={() => setShowArchiveModal(false)} handleConfirm={handleConfirmArchive} 
                itemName={itemToArchive?.name} 
                entityName="Dilution" 
                actionType="Archive" 
                isProcessing={isArchiving} 
            />
        </>
    );
}

export default DilutionTab;