import React, {useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaArchive, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import * as drugService from '../../services/drugService';
import FormulaModal from '../FormulaModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function FormulaTab() {
    const navigate = useNavigate();
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
            const data = await drugService.getAllFormulas();
            if (Array.isArray(data)) setList(data);
            else { setList([]); setError("Received invalid data format."); }
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = () => { setCurrentItem(null); setShowModal(true); };
    const handleEdit = (item) => { setCurrentItem(item); setShowModal(true); };
    const handleArchiveClick = (item) => { setItemToArchive(item); setShowArchiveModal(true); };

    const handleSave = async (itemData) => {
        try {
            if (currentItem && currentItem.formulaId) await drugService.updateFormula(currentItem.formulaId, itemData);
            else await drugService.addFormula(itemData);
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err.message); }
    };
    
    const handleConfirmArchive = async () => {
        if (!itemToArchive) return;
        setIsArchiving(true);
        try {
            await drugService.deleteFormula(itemToArchive.formulaId);
            setShowArchiveModal(false);
            setItemToArchive(null);
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsArchiving(false); }
    };

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button className="btn-custom-primary rounded-pill shadow-sm" onClick={handleAdd}>
                    <FaPlus className="me-2" /> Add Formula
                </Button>
            </div>

            {error && <Alert variant="danger"><FaExclamationTriangle className="me-2" />{error}</Alert>}

            {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div> : (
                <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                    <Table hover responsive className="align-middle mb-0">
                        <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Name</th>
                                <th>Creation Date</th>
                                <th>Ingredients</th>
                                <th className="text-center pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0 ? <tr><td colSpan="5" className="text-center text-muted p-4">No active formulas found.</td></tr> : list.map(item => (
                                <tr key={item.formulaId}>
                                    <td className="ps-4 text-muted fw-bold">#{item.formulaId}</td>
                                    <td className="entity-name-dark-blue">{item.name}</td>
                                    <td className="small text-muted">{item.creationDate ? format(new Date(item.creationDate), 'dd/MM/yyyy') : '-'}</td>
                                    <td>
                                        {/* --- NEW: Clean Ingredient Tags --- */}
                                        {item.FormulaDetails && item.FormulaDetails.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {item.FormulaDetails.map((detail, idx) => (
                                                    <span className="badge-ingredient" key={`${item.formulaId}-${idx}`}>
                                                        {detail.Inventory?.name || 'Unknown'} 
                                                        <span className="text-primary ms-1">({detail.requiredQuantity}{detail.Inventory?.unit})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <span className="text-muted small italic">No base ingredients</span>}
                                    </td>
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

            <FormulaModal show={showModal} handleClose={() => setShowModal(false)} handleSave={handleSave} item={currentItem} />
            <DeleteConfirmationModal 
                show={showArchiveModal} handleClose={() => setShowArchiveModal(false)} handleConfirm={handleConfirmArchive} 
                itemName={itemToArchive?.name} 
                entityName="Formula" 
                actionType="Archive" 
                isProcessing={isArchiving} 
            />
        </>
    );
}

export default FormulaTab;