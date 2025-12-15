import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaPlay } from 'react-icons/fa';
import { format } from 'date-fns';
import * as jobcardService from '../../services/jobcardService';
import * as drugService from '../../services/drugService';
import JobcardModal from '../JobcardModal';
import PrescriptionStepModal from '../PrescriptionStepModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

// This component now accepts a prop to tell its parent to switch tabs
function JobcardManagementTab({ onExecuteSuccess }) {
    const [jobcardList, setJobcardList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [showJobcardModal, setShowJobcardModal] = useState(false);
    const [showPrescriptionStepModal, setShowPrescriptionStepModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Data for modals and actions
    const [currentItem, setCurrentItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [tempJobcardData, setTempJobcardData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [executingId, setExecutingId] = useState(null); // State for the execute button's loading spinner

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await jobcardService.getAllJobcards();
            setJobcardList(data);
        } catch (err) { setError(err.message); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAdd = () => {
        setCurrentItem(null);
        setShowJobcardModal(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setShowJobcardModal(true);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleProceedToPrescriptionStep = (jobcardData) => {
        setTempJobcardData(jobcardData);
        setShowJobcardModal(false);
        setShowPrescriptionStepModal(true);
    };

    const handleSave = async (data) => {
        // This function's internal logic remains the same, but errors will be caught by the modal
        if (currentItem && currentItem.jobcardId) {
            await jobcardService.updateJobcard(currentItem.jobcardId, data);
            setShowJobcardModal(false);
        } else {
            const newPrescription = await drugService.addPrescription(data);
            const finalJobcardData = { ...tempJobcardData, prescriptionId: newPrescription.prescriptionId };
            await jobcardService.addJobcard(finalJobcardData);
            setShowPrescriptionStepModal(false);
        }
        fetchData();
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await jobcardService.deleteJobcard(itemToDelete.jobcardId);
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            setError(err.message);
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    // --- NEW EXECUTION HANDLER ---
    const handleExecute = async (jobcard) => {
        setExecutingId(jobcard.jobcardId);
        setError('');
        try {
            const result = await jobcardService.executeJobcard(jobcard.jobcardId);
            alert(result.message); // Show success message
            fetchData(); // Refresh the list to show the new "Processing" status
            onExecuteSuccess(); // Call the parent function to switch tabs
        } catch (err) {
            setError(err.message);
        } finally {
            setExecutingId(null);
        }
    };
    
    const getStatusBadge = (status) => {
        const map = { 'Pending': 'secondary', 'Approved': 'primary', 'Processing': 'info', 'Completed': 'success', 'Rejected': 'danger' };
        return map[status] || 'dark';
    };

    return (
        <>
            <div className="d-flex justify-content-end mb-3">
                <Button className="btn-custom-primary" onClick={handleAdd}>
                    <FaPlus className="me-2" /> Create Job Card
                </Button>
            </div>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            
            {loading ? ( <div className="text-center py-5"><Spinner animation="border" /></div> ) : (
                <Table striped hover responsive>
                   <thead>
                        <tr className="fw-bold">
                            <th>ID</th><th>Dilution Name</th><th>Patient Details</th>
                            <th>Requester</th><th>Status</th><th>Request Date</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobcardList.map(item => (
                            <tr key={item.jobcardId}>
                                <td>{item.jobcardId}</td>
                                <td>{item.Dilution?.name || 'N/A'}</td>
                                <td>{item.PrescriptionDetail ? `Age: ${item.PrescriptionDetail.age}, W: ${item.PrescriptionDetail.weight}kg` : 'N/A'}</td>
                                <td>{item.requester?.username || 'N/A'}</td>
                                <td><Badge bg={getStatusBadge(item.status)}>{item.status}</Badge></td>
                                <td>{format(new Date(item.requestDate), 'dd/MM/yyyy HH:mm')}</td>
                                <td>
                                    {/* Conditionally render the execute button only for 'Approved' jobcards */}
                                    {item.status === 'Approved' && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleExecute(item)}
                                            disabled={executingId === item.jobcardId}
                                            title="Send to Robot for Execution"
                                        >
                                            {executingId === item.jobcardId ? (
                                                <Spinner as="span" animation="border" size="sm" />
                                            ) : (
                                                <FaPlay />
                                            )}
                                        </Button>
                                    )}
                                    <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEdit(item)} title="Update Status"><FaEdit /></Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(item)}><FaTrash /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <JobcardModal show={showJobcardModal} handleClose={() => setShowJobcardModal(false)} handleSave={handleSave} handleNext={handleProceedToPrescriptionStep} item={currentItem} />
            <PrescriptionStepModal show={showPrescriptionStepModal} handleClose={() => setShowPrescriptionStepModal(false)} handleSave={handleSave} />
            <DeleteConfirmationModal show={showDeleteModal} handleClose={() => setShowDeleteModal(false)} handleConfirm={handleConfirmDelete} userName={`Job Card #${itemToDelete?.jobcardId}`} isDeleting={isDeleting} />
        </>
    );
}

export default JobcardManagementTab;