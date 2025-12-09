import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import * as jobcardService from '../services/jobcardService';
import * as drugService from '../services/drugService'; 
import JobcardModal from '../components/JobcardModal';
import PrescriptionStepModal from '../components/PrescriptionStepModal'; // Import the new step 2 modal
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

function JobcardsPage() {
    const [jobcardList, setJobcardList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State to manage all modals
    const [showJobcardModal, setShowJobcardModal] = useState(false);
    const [showPrescriptionStepModal, setShowPrescriptionStepModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // State for data
    const [currentItem, setCurrentItem] = useState(null); // Used for editing
    const [itemToDelete, setItemToDelete] = useState(null);
    const [tempJobcardData, setTempJobcardData] = useState(null); // Holds data from step 1

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

    // This function is called from the FIRST modal ("Next" button)
    const handleProceedToPrescriptionStep = (jobcardData) => {
        setTempJobcardData(jobcardData); // Store data from step 1
        setShowJobcardModal(false); // Close first modal
        setShowPrescriptionStepModal(true); // Open second modal
    };

    // This function handles both final save operations
   const handleSave = async (data) => {
    // We remove the try...catch block from here.
    // The component that calls this function will now be responsible
    // for handling its own errors and loading states.

    if (currentItem && currentItem.jobcardId) {
        // This is an EDIT operation
        await jobcardService.updateJobcard(currentItem.jobcardId, data);
        setShowJobcardModal(false); // Close the modal on success
    } else {
        // This is a NEW job card operation
        const prescriptionData = data;
        
        // Step 1: Create the prescription
        const newPrescription = await drugService.addPrescription(prescriptionData);
        
        // Step 2: Combine with stored job card data
        const finalJobcardData = {
            ...tempJobcardData,
            prescriptionId: newPrescription.prescriptionId
        };
        
        // Step 3: Create the job card
        await jobcardService.addJobcard(finalJobcardData);
        setShowPrescriptionStepModal(false); // Close the modal on success
    }
    fetchData(); // Refresh the list on success
};

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await jobcardService.deleteJobcard(itemToDelete.jobcardId);
            setShowDeleteModal(false);
            setItemToDelete(null);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };
    
    const getStatusBadge = (status) => {
        const map = {
            'Pending': 'secondary', 'Approved': 'primary', 'Processing': 'info',
            'Completed': 'success', 'Rejected': 'danger'
        };
        return map[status] || 'dark';
    };

    return (
        <>
            <Card className="shadow-sm border-light-subtle">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
                    <h2 className="mb-0">Job Card Management</h2>
                    <Button className="btn-custom-primary" onClick={handleAdd}>
                        <FaPlus className="me-2" /> Create Job Card
                    </Button>
                </Card.Header>
                <Card.Body>
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
                                            <Button variant="tertiary" size="sm" className="me-2" onClick={() => handleEdit(item)} title="Update Status"><FaEdit /></Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(item)}><FaTrash /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            <JobcardModal 
                show={showJobcardModal}
                handleClose={() => setShowJobcardModal(false)}
                handleSave={handleSave}
                handleNext={handleProceedToPrescriptionStep}
                item={currentItem}
            />

            <PrescriptionStepModal
                show={showPrescriptionStepModal}
                handleClose={() => setShowPrescriptionStepModal(false)}
                handleSave={handleSave}
            />

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={`Job Card #${itemToDelete?.jobcardId}`}
            />
        </>
    );
}

export default JobcardsPage;