import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Alert, Spinner, Badge, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaPlay, FaEye, FaArchive, FaUser, FaCheckCircle, FaSearch, FaSortAmountDown, FaExclamationTriangle, FaCommentDots } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as jobcardService from '../../services/jobcardService';
import JobcardModal from '../JobcardModal';
import RecipeSelectionModal from '../RecipeSelectionModal';
import JobcardDetailsModal from '../JobcardDetailsModal'; 
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import PatientParamsModal from '../PatientParamsModal';

function JobcardManagementTab({ onExecuteSuccess }) {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    
    const [jobcardList, setJobcardList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter & Sort States
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('triage'); // Default: Emergency Level DESC

    // Modals
    const [showJobcardModal, setShowJobcardModal] = useState(false);
    const [showPrescriptionStepModal, setShowPrescriptionStepModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [showPatientParamsModal, setShowPatientParamsModal] = useState(false);
    
    // States
    const [currentItem, setCurrentItem] = useState(null);
    const [selectedForDetails, setSelectedForDetails] = useState(null);
    const [itemToArchive, setItemToArchive] = useState(null);
    const [tempJobcardData, setTempJobcardData] = useState(null);
    const [isArchiving, setIsArchiving] = useState(false);
    const [executingId, setExecutingId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await jobcardService.getAllJobcards();
            setJobcardList(data);
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- HIGH-PERFORMANCE DYNAMIC FILTERING & SORTING (NO BLINKING) ---
    const processedJobcards = useMemo(() => {
        let result = [...jobcardList];

        // 1. Apply Search (Filter by Dilution, Requester, Approver)
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter(j => 
                j.Dilution?.name?.toLowerCase().includes(query) ||
                j.requester?.username?.toLowerCase().includes(query) ||
                j.approver?.username?.toLowerCase().includes(query)
            );
        }

        // 2. Apply Custom Sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case 'requestDate':
                    return new Date(b.requestDate) - new Date(a.requestDate);
                case 'approveDate':
                    return new Date(b.approveDate || 0) - new Date(a.approveDate || 0);
                case 'dilutionName':
                    return (a.Dilution?.name || '').localeCompare(b.Dilution?.name || '');
                case 'requester':
                    return (a.requester?.username || '').localeCompare(b.requester?.username || '');
                case 'approver':
                    return (a.approver?.username || '').localeCompare(b.approver?.username || '');
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'triage':
                default:
                    // Triage: Emergency Level DESC (5 to 1), then Request Date DESC
                    if (b.emergencyLevel !== a.emergencyLevel) {
                        return b.emergencyLevel - a.emergencyLevel;
                    }
                    return new Date(b.requestDate) - new Date(a.requestDate);
            }
        });

        return result;
    }, [jobcardList, searchTerm, sortBy]);

    const handleAdd = () => { setCurrentItem(null); setShowJobcardModal(true); };
    const handleEdit = (item) => { setCurrentItem(item); setShowJobcardModal(true); };
    const handleViewDetails = (item) => { setSelectedForDetails(item); setShowDetailsModal(true); };
    const handleArchiveClick = (item) => { setItemToArchive(item); setShowDeleteModal(true); };

 const handleProceedToPatientStep = (jobcardData) => {
        setTempJobcardData(jobcardData);
        setShowJobcardModal(false);
        setShowPatientParamsModal(true); // Jump to Step 2
    };

    const handleProceedToRecipeStep = (patientData) => {
        setTempJobcardData(patientData);
        setShowPatientParamsModal(false);
        setShowPrescriptionStepModal(true); // Jump to Step 3
    };

    const handleSave = async (finalData) => {
        try {
            if (currentItem?.jobcardId) {
                await jobcardService.updateJobcard(currentItem.jobcardId, finalData);
                setShowJobcardModal(false);
            } else {
                await jobcardService.addJobcard(finalData);
                setShowPrescriptionStepModal(false); // Close final step
            }
            fetchData();
        } catch (err) { throw err; }
    };
    const handleConfirmArchive = async () => {
        if (!itemToArchive) return;
        setIsArchiving(true);
        try {
            await jobcardService.archiveJobcard(itemToArchive.jobcardId);
            setShowDeleteModal(false);
            setItemToArchive(null);
            fetchData(); 
        } catch (err) { setError(err.message); } 
        finally { setIsArchiving(false); }
    };

    const handleExecute = async (jobcard) => {
        setExecutingId(jobcard.jobcardId);
        try {
            const result = await jobcardService.executeJobcard(jobcard.jobcardId, user.userId);
            alert(result.message);
            fetchData();
            onExecuteSuccess();
        } catch (err) { setError(err.message); } 
        finally { setExecutingId(null); }
    };

    const getStatusBadge = (status) => {
        const map = { 
            'Pending': 'bg-status-pending', 
            'Approved': 'bg-status-approved', 
            'Processing': 'bg-status-processing', 
            'Completed': 'bg-status-completed', 
            'Rejected': 'bg-status-rejected' 
        };
        return map[status] || 'bg-status-unknown';
    };

    // --- Color coded emergency level pills ---
    const getEmergencyLevelBadge = (level) => {
        switch (level) {
            case 5: return { css: 'text-emergency-5', text: '5' };
            case 4: return { css: 'text-emergency-4', text: '4' };
            case 3: return { css: 'text-emergency-3', text: '3' };
            case 2: return { css: 'text-emergency-2', text: '2' };
            case 1: 
            default:
                return { css: 'text-emergency-1', text: '1' };
        }
    };

    return (
        <>
            {/* SEARCH & FILTER CONTROLS */}
            <div className="bg-white p-3 rounded-4 shadow-sm border mb-4">
                <Row className="align-items-end g-3">
                    <Col md={5}>
                        <Form.Group controlId="jobcardSearch">
                            <Form.Label className="small fw-bold text-muted">SEARCH JOBCARDS</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Search by Product, Requester, or Approver..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-light border-0"
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="jobcardSort">
                            <Form.Label className="small fw-bold text-muted"><FaSortAmountDown className="me-2"/>SORT WORKSPACE BY</Form.Label>
                            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-light border-0 py-2">
                                <option value="triage">Triage (Emergency Level 5 → 1)</option>
                                <option value="requestDate">Request Date & Time</option>
                                <option value="approveDate">Approval Date & Time</option>
                                <option value="dilutionName">Dilution Product Name</option>
                                <option value="requester">Requester Name</option>
                                <option value="approver">Approver Name</option>
                                <option value="status">Operational Status</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3} className="text-end">
                        <Button className="btn-custom-primary shadow-sm w-100 py-2 rounded-pill" onClick={handleAdd}>
                            <FaPlus className="me-2" /> Create Job Card
                        </Button>
                    </Col>
                </Row>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            
            {loading ? ( 
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> 
            ) : (
                <div className="table-responsive bg-white rounded-4 shadow-sm border">
                    <Table hover className="align-middle mb-0">
                       <thead className="table-light text-muted small text-uppercase">
                            <tr>
                                <th className="ps-4" style={{ width: '80px' }}>ID</th>
                                <th className="text-center" style={{ width: '80px' }}>Level</th>
                                <th>Dilution Name</th>
                                <th>Requester</th>
                                <th>Request Datetime</th>
                                <th>Approver</th>
                                <th>Approve Datetime</th>
                                <th>Status</th>
                                <th className="text-center pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedJobcards.length > 0 ? processedJobcards.map(item => {
                                const emg = getEmergencyLevelBadge(item.emergencyLevel);
                                return (
                                    <tr key={item.jobcardId}>
                                        <td className="ps-4">
                                            <Badge bg="light" text="dark" className="border">#{item.jobcardId}</Badge>
                                        </td>
                                        
                                        {/* NEW EMERGENCY LEVEL BADGE */}
                                        <td className="text-center">
                                            <span className={emg.css}>
                                                {emg.text}
                                            </span>
                                        </td>

                                        <td className="entity-name-dark-blue">{item.Dilution?.name}</td>
                                        
                                        <td>
                                            <div className="small d-flex align-items-center justify-content-between">
                                                <span>
                                                    <FaUser className="me-1 text-muted"/> {item.requester?.username || 'N/A'}
                                                </span>
                                                {item.requester?.userId && user.userId !== item.requester.userId && (
                                                    <FaCommentDots 
                                                        className="text-primary cursor-pointer ms-2" 
                                                        title={`Message ${item.requester.username}`}
                                                        onClick={() => navigate('/chat', { state: { contactId: item.requester.userId } })}
                                                        style={{ fontSize: '1.1rem' }}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td className="small text-muted">{format(new Date(item.requestDate), 'dd/MM/yyyy HH:mm')}</td>
                                        
                                        <td>
                                            {item.approver ? (
                                                <div className="small d-flex align-items-center justify-content-between">
                                                    <span>
                                                        <FaCheckCircle className="me-1 text-success"/> {item.approver.username}
                                                    </span>
                                                    {user.userId !== item.approver.userId && (
                                                        <FaCommentDots 
                                                            className="text-primary cursor-pointer ms-2" 
                                                            title={`Message ${item.approver.username}`}
                                                            onClick={() => navigate('/chat', { state: { contactId: item.approver.userId } })}
                                                            style={{ fontSize: '1.1rem' }}
                                                        />
                                                    )}
                                                </div>
                                            ) : <span className="text-muted small fst-italic">Waiting...</span>}
                                        </td>
                                        
                                        <td className="small text-muted">{item.approveDate ? format(new Date(item.approveDate), 'dd/MM/yyyy HH:mm') : '-'}</td>
                                        
                                        <td>
                                            <span className={`custom-status-badge ${getStatusBadge(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        
                                        <td className="text-center pe-4">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn-table-action" onClick={() => handleViewDetails(item)} title="Technical Info">
                                                    <FaEye />
                                                </button>

                                                {item.status === 'Approved' && (
                                                    <button className="btn-table-action text-success" onClick={() => handleExecute(item)} disabled={executingId === item.jobcardId} title="Execute Jobcard">
                                                        {executingId === item.jobcardId ? <Spinner size="sm" /> : <FaPlay />}
                                                    </button>
                                                )}

                                                <button className="btn-table-action" onClick={() => handleEdit(item)} title="Edit Jobcard">
                                                    <FaEdit />
                                                </button>

                                                <button className="btn-table-action" onClick={() => handleArchiveClick(item)} title="Archive Jobcard">
                                                    <FaArchive />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="9" className="text-center p-5 text-muted">
                                        <FaExclamationTriangle size={30} className="mb-3 opacity-50" />
                                        <p className="mb-0">No active jobcards found matching your query.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* VIEW ARCHIVED LINK */}
            {!loading && (
                <div className="d-flex justify-content-center mt-4 mb-3">
                    <Button 
                        variant="light" 
                        className="archive-bottom-btn shadow-sm"
                        onClick={() => navigate('/jobcards/archive')}
                    >
                        <FaArchive className="me-2 text-muted" />
                        <span className="fw-bold text-muted">View Archived Jobcards</span>
                    </Button>
                </div>
            )}

            {/* MODALS */}
             <JobcardDetailsModal show={showDetailsModal} handleClose={() => setShowDetailsModal(false)} jobcard={selectedForDetails} />
            
            {/* STEP 1: Select dilution (Now redirects to Patient Params) */}
            <JobcardModal show={showJobcardModal} handleClose={() => setShowJobcardModal(false)} handleSave={handleSave} handleNext={handleProceedToPatientStep} item={currentItem} />
            
            {/* STEP 2: Input patient age & weight */}
            <PatientParamsModal show={showPatientParamsModal} handleClose={() => setShowPatientParamsModal(false)} handleNext={handleProceedToRecipeStep} tempJobcardData={tempJobcardData} />
            
            {/* STEP 3: Auto-Suggest & Ingredients (Now saves everything) */}
            <RecipeSelectionModal show={showPrescriptionStepModal} handleClose={() => setShowPrescriptionStepModal(false)} handleSave={handleSave} tempJobcardData={tempJobcardData} />

            <DeleteConfirmationModal show={showDeleteModal} handleClose={() => setShowDeleteModal(false)} handleConfirm={handleConfirmArchive} userName={`Job Card #${itemToArchive?.jobcardId}`} isDeleting={isArchiving} />
        </>
    );
}

export default JobcardManagementTab;