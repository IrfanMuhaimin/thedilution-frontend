import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Spinner, Alert, ButtonGroup, Button, ListGroup } from 'react-bootstrap';
import * as dashboardService from '../services/dashboardService';
import RolePieChart from '../components/charts/RolePieChart';
import HardwareDoughnutChart from '../components/charts/HardwareDoughnutChart';
import JobcardBarChart from '../components/charts/JobcardBarChart';

function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeFilter, setTimeFilter] = useState(7); // Default to weekly (7 days)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await dashboardService.getDashboardData(timeFilter);
            setDashboardData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [timeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="text-center py-5"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Row>
            {/* --- TOP ROW: THREE CARDS IN ONE LINE --- */}
            {/* On medium (md) screens and up, each card takes up 4 of 12 columns */}
            
            {/* CARD 1: ROLE DISTRIBUTION */}
            <Col md={4} className="mb-4">
                <Card className="shadow-sm h-100">
                    <Card.Body>
                        {dashboardData && <RolePieChart data={dashboardData.userDistribution} />}
                    </Card.Body>
                </Card>
            </Col>

            {/* CARD 2: HARDWARE DISTRIBUTION */}
            <Col md={4} className="mb-4">
                <Card className="shadow-sm h-100">
                    <Card.Body>
                        {dashboardData && <HardwareDoughnutChart data={dashboardData.machineDistribution} />}
                    </Card.Body>
                </Card>
            </Col>

            {/* CARD 3: ACTIVE MACHINES */}
            <Col md={4} className="mb-4">
                <Card className="shadow-sm h-100">
                    <Card.Header className="bg-white"><h5 className="mb-0">Active Machines Running</h5></Card.Header>
                    <ListGroup variant="flush" style={{ overflowY: 'auto', maxHeight: '300px' }}>
                        {dashboardData && dashboardData.activeMachines.length > 0 ? (
                            dashboardData.activeMachines.map(machine => (
                                <ListGroup.Item key={machine.hardwareId}>
                                    <strong>{machine.name}</strong>
                                    <small className="d-block text-muted">
                                        Handling {machine.Jobcards.length} jobcard(s)
                                    </small>
                                </ListGroup.Item>
                            ))
                        ) : (
                            <ListGroup.Item>No machines are currently active.</ListGroup.Item>
                        )}
                    </ListGroup>
                </Card>
            </Col>

            {/* --- BOTTOM ROW: BAR CHART WITH FILTERS --- */}
            {/* This card now takes up the full width of the second row */}
            <Col xs={12} className="mb-4">
                <Card className="shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-white">
                        <h5 className="mb-0">Jobcard Statistics</h5>
                         <ButtonGroup size="sm">
                            <Button 
                                className={timeFilter === 1 ? 'btn-custom-primary' : 'btn-custom-secondary'} 
                                onClick={() => setTimeFilter(1)}
                            >
                                Daily
                            </Button>
                            <Button 
                                className={timeFilter === 7 ? 'btn-custom-primary' : 'btn-custom-secondary'} 
                                onClick={() => setTimeFilter(7)}
                            >
                                Weekly
                            </Button>
                            <Button 
                                className={timeFilter === 30 ? 'btn-custom-primary' : 'btn-custom-secondary'} 
                                onClick={() => setTimeFilter(30)}
                            >
                                Monthly
                            </Button>
                        </ButtonGroup>
                    </Card.Header>
                    <Card.Body>
                        {dashboardData && <JobcardBarChart data={dashboardData.dilutionStats} />}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default DashboardPage;