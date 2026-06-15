import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Alert, Spinner, Badge, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaPlay, FaEye, FaArchive, FaUser, FaCheckCircle, FaSearch, FaSortAmountDown, FaExclamationTriangle } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as jobcardService from '../../services/jobcardService';
import JobcardModal from '../JobcardModal';
import PatientParamsModal from '../PatientParamsModal';
import RecipeSelectionModal from '../RecipeSelectionModal';
import JobcardDetailsModal from '../JobcardDetailsModal'; 
import DeleteConfirmationModal from '../DeleteConfirmationModal';

function JobcardManagementTab({ onExecuteSuccess }) {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    
    const [jobcardList, setJobcardList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter & Sort States
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('triage');

    // Modals
    const [showJobcardModal, setShowJobcardModal] = useState(false);
    const [showPatientParamsModal, setShowPatientParamsModal] = useState(false);
    const [showPrescriptionStepModal, setShowPrescriptionStepModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
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

    const handleBackToStep1 = () => {
        setShowPatientParamsModal(false);
        setShowJobcardModal(true); // Open Step 1
    };

    const handleBackToStep2 = () => {
        setShowPrescriptionStepModal(false);
        setShowPatientParamsModal(true); // Open Step 2
    };

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- HIGH-PERFORMANCE DYNAMIC FILTERING & SORTING ---
    const processedJobcards = useMemo(() => {
        let result = [...jobcardList];

        // 1. Search filter
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter(j => 
                j.Dilution?.name?.toLowerCase().includes(query) ||
                j.requester?.username?.toLowerCase().includes(query) ||
                j.executor?.username?.toLowerCase().includes(query)
            );
        }

        // 2. Sort Logic
        result.sort((a, b) => {
            switch (sortBy) {
                case 'requestDate':
                    return new Date(b.requestDate) - new Date(a.requestDate);
                case 'executionDate':
                    return new Date(b.executionDate || 0) - new Date(a.executionDate || 0);
                case 'dilutionName':
                    return (a.Dilution?.name || '').localeCompare(b.Dilution?.name || '');
                case 'requester':
                    return (a.requester?.username || '').localeCompare(b.requester?.username || '');
                case 'executor':
                    return (a.executor?.username || '').localeCompare(b.executor?.username || '');
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'triage':
                default:
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
        setShowPatientParamsModal(true);
    };

    const handleProceedToRecipeStep = (patientData) => {
        setTempJobcardData(patientData);
        setShowPatientParamsModal(false);
        setShowPrescriptionStepModal(true);
    };

    const handleSave = async (finalData) => {
        try {
            if (currentItem?.jobcardId) {
                await jobcardService.updateJobcard(currentItem.jobcardId, finalData);
                setShowJobcardModal(false);
            } else {
                await jobcardService.addJobcard(finalData);
                setShowPrescriptionStepModal(false);
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
            
            navigate('/jobcards', { 
                state: { activeExecutionHardwareId: jobcard.hardwareId } 
            });
            onExecuteSuccess();
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setExecutingId(null); 
        }
    };

    const getStatusBadge = (status) => {
        const map = { 
            'Pending': 'bg-status-pending', 
            'Processing': 'bg-status-processing', 
            'Completed': 'bg-status-completed', 
            'Rejected': 'bg-status-rejected' 
        };
        return map[status] || 'bg-status-unknown';
    };

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
            {/* CONTROL PANEL */}
            <div className="bg-white p-3 rounded-4 shadow-sm border mb-4">
                <Row className="align-items-end g-3">
                    <Col md={5}>
                        <Form.Group controlId="jobcardSearch">
                            <Form.Label className="small fw-bold text-muted">SEARCH WORKSPACE</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-0"><FaSearch className="text-muted" /></InputGroup.Text>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Product, Requester, or Executor..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-light border-0"
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="jobcardSort">
                            <Form.Label className="small fw-bold text-muted"><FaSortAmountDown className="me-2"/>SORT BY</Form.Label>
                            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-light border-0 py-2">
                                <option value="triage">Triage (Emergency Level 5 → 1)</option>
                                <option value="requestDate">Request Datetime</option>
                                <option value="executionDate">Execution Datetime</option>
                                <option value="dilutionName">Dilution Name</option>
                                <option value="requester">Requester Name</option>
                                <option value="executor">Executor Name</option>
                                <option value="status">Status</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3} className="text-end">
                        {user.role !== 'Admin' && (
                            <Button className="btn-custom-primary shadow-sm w-100 py-2 rounded-pill" onClick={handleAdd}>
                                <FaPlus className="me-2" /> Create Job Card
                            </Button>
                        )}
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
                                <th>Level</th>
                                <th>Dilution Name</th>
                                <th>Requester</th>
                                <th>Request Datetime</th>
                                <th>Executor</th>
                                <th>Execution Datetime</th>
                                <th>Status</th>
                                <th className="text-center pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedJobcards.length > 0 ? processedJobcards.map(item => {
                                const emg = getEmergencyLevelBadge(item.emergencyLevel);
                                const canExecute = user.role === 'Doctor' || user.role === 'Pharmacist';
                                return (
                                    <tr key={item.jobcardId}>
                                        <td className="ps-4">
                                            <Badge bg="light" text="dark" className="border">#{item.jobcardId}</Badge>
                                        </td>
                                        
                                        <td><span className={`fw-bold ${emg.css}`}>{emg.text}</span></td>

                                        <td className="entity-name-dark-blue">{item.Dilution?.name}</td>
                                        
                                        <td>
                                            <span className="small fw-bold">
                                                <FaUser className="me-1 text-muted"/> {item.requester?.username || 'N/A'}
                                            </span>
                                        </td>
                                        
                                        <td className="small text-muted">{format(new Date(item.requestDate), 'dd/MM/yyyy HH:mm')}</td>
                                        
                                        <td>
                                            {item.executor ? (
                                                <div className="small fw-bold text-success">
                                                    <FaCheckCircle className="me-1 text-success"/> {item.executor.username}
                                                </div>
                                            ) : <span className="text-muted small fst-italic">Not executed</span>}
                                        </td>
                                        
                                        <td className="small text-muted">{item.executionDate ? format(new Date(item.executionDate), 'dd/MM/yyyy HH:mm') : '-'}</td>
                                        
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

                                                {/* EXECUTE BUTTON - ONLY FOR PENDING JOBS & FORBIDDEN FOR ADMINS */}
                                                {item.status === 'Pending' && canExecute && (
                                                    <button className="btn-table-action text-success" onClick={() => handleExecute(item)} disabled={executingId === item.jobcardId} title="Execute to Robot">
                                                        {executingId === item.jobcardId ? <Spinner size="sm" /> : <FaPlay />}
                                                    </button>
                                                )}

                                                {/* EDIT BUTTON - Disabled if already Completed */}
                                                {item.status === 'Pending' && (
                                                    <button className="btn-table-action" onClick={() => handleEdit(item)} title="Edit Jobcard">
                                                        <FaEdit />
                                                    </button>
                                                )}

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
                    <Button variant="light" className="archive-bottom-btn shadow-sm" onClick={() => navigate('/jobcards/archive')}>
                        <FaArchive className="me-2 text-muted" /> <span className="fw-bold text-muted">View Archived Jobcards</span>
                    </Button>
                </div>
            )}

            {/* MODALS */}
           <JobcardDetailsModal show={showDetailsModal} handleClose={() => setShowDetailsModal(false)} jobcard={selectedForDetails} />
            
            {/* STEP 1: Select dilution (Cancel closes, Next goes to Step 2) */}
            <JobcardModal show={showJobcardModal} handleClose={() => setShowJobcardModal(false)} handleSave={handleSave} handleNext={handleProceedToPatientStep} item={currentItem} />
            
            {/* STEP 2: Input patient params (Back goes to Step 1, Next goes to Step 3) */}
            <PatientParamsModal 
                show={showPatientParamsModal} 
                handleClose={() => setShowPatientParamsModal(false)} 
                handleBack={handleBackToStep1} // NEW
                handleNext={handleProceedToRecipeStep} 
                tempJobcardData={tempJobcardData} 
            />
            
            {/* STEP 3: Auto-Suggest & Ingredients (Back goes to Step 2, Submit saves) */}
            <RecipeSelectionModal 
                show={showPrescriptionStepModal} 
                handleClose={() => setShowPrescriptionStepModal(false)} 
                handleBack={handleBackToStep2} // NEW
                handleSave={handleSave} 
                tempJobcardData={tempJobcardData} 
            />

            <DeleteConfirmationModal 
                show={showDeleteModal} 
                handleClose={() => setShowDeleteModal(false)} 
                handleConfirm={handleConfirmArchive} 
                itemName={`Jobcard #${itemToArchive?.jobcardId}`} 
                entityName="Jobcard" 
                actionType="Archive" 
                isProcessing={isArchiving} 
            />
        </>
    );
}

export default JobcardManagementTab;