import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, Alert, Spinner, ListGroup, Badge, Form, Col, Row } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEye, FaFilePdf } from 'react-icons/fa';
import { format } from 'date-fns';
import * as reportService from '../services/reportService';
import ReportGenerationModal from '../components/ReportGenerationModal';
// --- 1. FIX: Corrected the import path for DeleteConfirmationModal ---
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'; 
import ReportDetails from '../components/ReportDetails';

function ReportPage() {
    const [reportList, setReportList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');

    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    const [reportToDelete, setReportToDelete] = useState(null);
    const [expandedReport, setExpandedReport] = useState(null);
    const [downloadingReportId, setDownloadingReportId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await reportService.getAllReports();
            data.sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
            setReportList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (filter === 'All') {
            setFilteredList(reportList);
        } else {
            setFilteredList(reportList.filter(r => r.reportType === filter));
        }
    }, [filter, reportList]);

    const handleGenerate = async (reportData) => {
        try {
            await reportService.generateReport(reportData);
            setShowGenerateModal(false);
            fetchData();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // --- 2. FIX: Added complete logic for handler functions ---
    const handleDelete = (report) => {
        setReportToDelete(report);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!reportToDelete) return;
        try {
            await reportService.deleteReport(reportToDelete.reportId);
            setShowDeleteModal(false);
            setReportToDelete(null);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };
    
    const toggleDetails = (reportId) => {
        if (expandedReport === reportId) {
            setExpandedReport(null); // Collapse if it's already open
        } else {
            setExpandedReport(reportId); // Expand the new one
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
            a.download = `report-${report.reportId}-${report.reportType}.pdf`; 
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
            <Card className="shadow-sm border-light-subtle">
                <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
                    <h2 className="mb-0">Report Management</h2>
                    <Button className="btn-custom-primary" onClick={() => setShowGenerateModal(true)}>
                        <FaPlus className="me-2" /> Generate Report
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Form className="mb-4">
                        <Row className="align-items-center">
                            <Col md={4}>
                                <Form.Group controlId="reportTypeFilter">
                                    <Form.Label className="fw-bold">Filter by Report Type</Form.Label>
                                    <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                        <option value="All">All Types</option>
                                        <option value="Jobcard">Jobcard</option>
                                        <option value="Inventory">Inventory</option>
                                        <option value="Hardware">Hardware</option>
                                        <option value="Consumption">Consumption</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" /></div>
                    ) : (
                        <ListGroup variant="flush">
                            {filteredList.map(report => (
                                <ListGroup.Item key={report.reportId}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <Badge bg="primary" className="me-2">{report.reportType}</Badge>
                                            <strong>Report ID: {report.reportId}</strong>
                                            <span className="text-muted ms-2">
                                                - Generated on {format(new Date(report.generatedDate), 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                        <div>
                                            <Button variant="info" size="sm" className="me-2" onClick={() => toggleDetails(report.reportId)}>
                                                <FaEye className="me-1" /> {expandedReport === report.reportId ? 'Hide' : 'View'} Details
                                            </Button>
                                            <Button 
                                                variant="success" 
                                                size="sm" 
                                                className="me-2"
                                                disabled={downloadingReportId === report.reportId}
                                                onClick={() => handleDownload(report)}
                                            >
                                                {downloadingReportId === report.reportId ? (
                                                    <Spinner as="span" animation="border" size="sm" />
                                                ) : (
                                                    <FaFilePdf />
                                                )}
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(report)}><FaTrash /></Button>
                                        </div>
                                    </div>
                                    {expandedReport === report.reportId && <ReportDetails report={report} />}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>

            <ReportGenerationModal 
                show={showGenerateModal}
                handleClose={() => setShowGenerateModal(false)}
                handleGenerate={handleGenerate}
            />

            <DeleteConfirmationModal 
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                handleConfirm={handleConfirmDelete}
                userName={`Report #${reportToDelete?.reportId}`}
            />
        </>
    );
}

export default ReportPage;