import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Alert, Spinner, Form, Col, Row, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaEye, FaFilePdf, FaSearch, FaArchive } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // NEW: For routing to archive
import * as reportService from '../services/reportService';

import ReportGenerationModal from '../components/ReportGenerationModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'; 
import ReportDetailsModal from '../components/ReportDetailsModal';

function ReportPage() {
    const navigate = useNavigate(); // Hook for navigation
    const [reportList, setReportList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');

    // Modal Visibility States
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Reused for archiving
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // Data States
    const [reportToDelete, setReportToDelete] = useState(null); // The report being archived
    const [selectedReport, setSelectedReport] = useState(null);
    const [downloadingReportId, setDownloadingReportId] = useState(null);
    const [isArchiving, setIsArchiving] = useState(false);

    // Fetch active reports
    const fetchData = useCallback(async () => {
        try {
            setLoading(true); setError('');
            const data = await reportService.getAllReports();
            data.sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
            setReportList(data);
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Local filtering
    useEffect(() => {
        if (filter === 'All') setFilteredList(reportList);
        else setFilteredList(reportList.filter(r => r.reportType === filter));
    }, [filter, reportList]);

    // Handlers
    const handleGenerate = async (reportData) => {
        try {
            await reportService.generateReport(reportData);
            setShowGenerateModal(false);
            fetchData();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleViewDetails = (report) => { setSelectedReport(report); setShowDetailsModal(true); };
    const handleArchiveClick = (report) => { setReportToDelete(report); setShowDeleteModal(true); };

    // This calls the backend delete route, which we modified to act as an Archive
    const handleConfirmArchive = async () => {
        if (!reportToDelete) return;
        setIsArchiving(true);
        try {
            await reportService.deleteReport(reportToDelete.reportId); 
            setShowDeleteModal(false);
            setReportToDelete(null);
            fetchData(); // Refresh list to remove archived item
        } catch (err) { 
            setError(err.message); 
        } finally {
            setIsArchiving(false);
        }
    };
    
    const handleDownload = async (report) => {
        setDownloadingReportId(report.reportId);
        setError('');
        try {
            const blob = await reportService.downloadReportPdf(report.reportId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Clinical_Report_${report.reportId}_${report.reportType}.pdf`; 
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) { 
            setError(err.message); 
        } finally { 
            setDownloadingReportId(null); 
        }
    };

    return (
        <>
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3 border-0">
                    <h2 className="mb-0 text-primary fw-bold">Clinical Reports</h2>
                    <Button className="btn-custom-primary rounded-pill px-4 shadow-sm" onClick={() => setShowGenerateModal(true)}>
                        <FaPlus className="me-2" /> Generate Report
                    </Button>
                </Card.Header>
                <Card.Body className="p-4 bg-light">
                    {/* Filters */}
                    <Form className="mb-4">
                        <Row className="align-items-end">
                            <Col md={4}>
                                <Form.Group controlId="reportTypeFilter">
                                    <Form.Label className="small fw-bold text-muted">FILTER BY AUDIT TYPE</Form.Label>
                                    <div className="position-relative">
                                        <FaSearch className="position-absolute text-muted" style={{ top: '12px', left: '15px' }} />
                                        <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)} className="shadow-sm border-0" style={{ paddingLeft: '35px' }}>
                                            <option value="All">All Official Reports</option>
                                            <option value="Jobcard">Medication Audits (Jobcards)</option>
                                            <option value="Inventory">Stock Audits (Inventory)</option>
                                            <option value="Consumption">Traceability Logs (Consumption)</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

                    {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                    
                    {/* Data Table */}
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div> 
                    ) : (
                        <div className="bg-white rounded-4 shadow-sm overflow-hidden border">
                            <Table hover responsive className="align-middle mb-0">
                                <thead className="table-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4">ID</th>
                                        <th>Audit Type</th>
                                        <th>Generated By</th>
                                        <th>Timestamp</th>
                                        <th className="text-center pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.length > 0 ? filteredList.map(report => (
                                        <tr key={report.reportId}>
                                            <td className="ps-4">
                                                <Badge bg="light" text="dark" className="border">#{report.reportId}</Badge>
                                            </td>
                                            <td className="entity-name-dark-blue">{report.reportType} Audit</td>
                                            <td className="fw-bold text-muted">{report.User?.username}</td>
                                            <td className="small text-muted">{format(new Date(report.generatedDate), 'dd/MM/yyyy HH:mm')}</td>
                                            <td className="text-center pe-4">
                                                <div className="d-flex justify-content-center gap-2">
                                                    {/* View Details Button */}
                                                    <button className="btn-table-action" onClick={() => handleViewDetails(report)} title="View Summary">
                                                        <FaEye />
                                                    </button>
                                                    
                                                    {/* Download PDF Button */}
                                                    <button className="btn-table-action text-success" onClick={() => handleDownload(report)} disabled={downloadingReportId === report.reportId} title="Download PDF">
                                                        {downloadingReportId === report.reportId ? <Spinner size="sm" /> : <FaFilePdf />}
                                                    </button>
                                                    
                                                    {/* Archive Button */}
                                                    <button className="btn-table-action" onClick={() => handleArchiveClick(report)} title="Archive Record">
                                                        <FaArchive />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <tr><td colSpan="5" className="text-center text-muted p-4">No reports found.</td></tr>}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* VIEW ARCHIVED LINK */}
                    {!loading && (
                        <div className="d-flex justify-content-center mt-4">
                            <Button variant="light" className="archive-bottom-btn shadow-sm" onClick={() => navigate('/reports/archive')}>
                                <FaArchive className="me-2 text-muted" /> <span className="fw-bold text-muted">View Archived Reports</span>
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modals */}
            <ReportGenerationModal show={showGenerateModal} handleClose={() => setShowGenerateModal(false)} handleGenerate={handleGenerate} />
            <ReportDetailsModal show={showDetailsModal} handleClose={() => setShowDetailsModal(false)} report={selectedReport} />
            
            {/* Archive Confirmation Modal */}
            <DeleteConfirmationModal 
                show={showDeleteModal} 
                handleClose={() => setShowDeleteModal(false)} 
                handleConfirm={handleConfirmArchive} 
                itemName={`Report #${reportToDelete?.reportId}`} 
                entityName="Report" 
                actionType="Archive" 
                isProcessing={isArchiving} 
            />
        </>
    );
}

export default ReportPage;