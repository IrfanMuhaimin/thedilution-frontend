import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaExclamationTriangle, FaChartLine, FaCapsules, FaUsers, FaRobot, FaShieldAlt } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import * as dashboardService from '../services/dashboardService';

import JobcardLineChart from '../components/charts/JobcardLineChart';
import TopFormulationsBarChart from '../components/charts/TopFormulationsBarChart';
import StockForecastAreaChart from '../components/charts/StockForecastAreaChart';
import DemographicsScatterChart from '../components/charts/DemographicsScatterChart';
import StatusPipelineDoughnut from '../components/charts/StatusPipelineDoughnut';
import RolePieChart from '../components/charts/RolePieChart';

import '../styles/Dashboard.css';

// 1. Memoize the Card Wrapper so it doesn't flash
const DashboardCard = React.memo(({ title, icon, children }) => (
    <div className="db-card shadow-sm border-0 rounded-4">
        <div className="db-card-header bg-white border-bottom py-3">
            <div className="d-flex align-items-center fw-bold text-primary">
                <span className="me-2 fs-5 text-warning">{icon}</span> {title}
            </div>
        </div>
        <div className="db-card-body p-4">{children}</div>
    </div>
));

function DashboardPage() {
    const { user } = useAuth();
    
    // Use refs to hold data to prevent unnecessary state triggers during polling
    const rawDataRef = useRef(null);
    const rawAiDataRef = useRef([]);

    const [data, setData] = useState(null);
    const [aiData, setAiData] = useState([]);
    
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [aiLoading, setAiLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [error, setError] = useState('');
    const [timeFilter, setTimeFilter] = useState(7);

    // FETCH MAIN DATA
    useEffect(() => {
        let isMounted = true;

        const fetchMainData = async () => {
            if (!isInitialLoad) setIsRefreshing(true);
            try {
                const res = await dashboardService.getDashboardData(timeFilter);
                if (isMounted) {
                    // Only update state if data actually changed (prevents blinking)
                    if (JSON.stringify(rawDataRef.current) !== JSON.stringify(res)) {
                        rawDataRef.current = res;
                        setData(res);
                    }
                    setError('');
                }
            } catch (err) { 
                if (isMounted) setError(err.message); 
            } finally { 
                if (isMounted) {
                    setIsInitialLoad(false);
                    setIsRefreshing(false);
                }
            }
        };

        fetchMainData();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeFilter]); // Only depends on timeFilter now

    // FETCH AI DATA
    useEffect(() => {
        let isMounted = true;

        const fetchAiData = async () => {
            if (user.role === 'Doctor') {
                setAiLoading(false);
                return;
            }
            try {
                const res = await dashboardService.getDashboardForecast();
                if (isMounted) {
                    if (JSON.stringify(rawAiDataRef.current) !== JSON.stringify(res)) {
                        rawAiDataRef.current = res;
                        setAiData(res);
                    }
                }
            } catch (err) { 
                console.error("AI Fetch Error", err); 
            } finally { 
                if (isMounted) setAiLoading(false); 
            }
        };

        fetchAiData();
        return () => { isMounted = false; };
    }, [user.role]);

    const formatDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Ensure we don't show the error screen if we already have data
    if (isInitialLoad && !data) {
        return (
            <div className="dashboard-loading">
                <Spinner animation="border" variant="primary" style={{width: '50px', height: '50px', borderWidth: '5px'}}/>
                <span className="mt-3 fw-bold text-muted">Health is Our Priority...</span>
            </div>
        );
    }
    
    if (error && !data) return <div className="dashboard-error"><FaExclamationTriangle /> <span>{error}</span></div>;

    const renderDoctorDashboard = () => (
        <div className="db-grid">
            <DashboardCard title="My Request vs Approval Pipeline" icon={<FaChartLine />}><JobcardLineChart data={data?.lineChartData} /></DashboardCard>
            <DashboardCard title="My Top Prescriptions" icon={<FaCapsules />}><TopFormulationsBarChart data={data?.topFormulations} /></DashboardCard>
            <DashboardCard title="Patient Demographics" icon={<FaUsers />}><DemographicsScatterChart data={data?.demographics} /></DashboardCard>
            <DashboardCard title="Current Jobcard Status" icon={<FaRobot />}><StatusPipelineDoughnut data={data?.statusPipeline} /></DashboardCard>
        </div>
    );

    const renderPharmacistDashboard = () => (
        <div className="db-grid">
            <DashboardCard title="Global Request vs Approval Pipeline" icon={<FaChartLine />}><JobcardLineChart data={data?.lineChartData} /></DashboardCard>
            <DashboardCard title="AI Stock Depletion Forecast" icon={<FaExclamationTriangle />}>
                {aiLoading ? <div className="text-center py-5"><Spinner animation="grow" variant="warning" /><p className="mt-3 text-muted small fw-bold">Analyzing inventory...</p></div> : <StockForecastAreaChart data={aiData} />}
            </DashboardCard>
            <DashboardCard title="Global Jobcard Pipeline" icon={<FaRobot />}><StatusPipelineDoughnut data={data?.statusPipeline} /></DashboardCard>
            <DashboardCard title="Most Mixed Formulations" icon={<FaCapsules />}><TopFormulationsBarChart data={data?.topFormulations} /></DashboardCard>
        </div>
    );

    const renderAdminDashboard = () => (
        <div className="db-grid">
            {/* ROW 1: System Workload and User Role Distribution */}
            <DashboardCard title="System Workload (Jobcards)" icon={<FaChartLine />}>
                <JobcardLineChart data={data?.lineChartData} />
            </DashboardCard>

            <DashboardCard title="Critical Stock Forecast" icon={<FaExclamationTriangle />}>
                {aiLoading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center h-100 py-4">
                        <Spinner animation="grow" variant="warning" />
                        <span className="mt-3 text-muted fw-bold small">Analyzing inventory...</span>
                    </div>
                ) : (
                    <StockForecastAreaChart data={aiData} />
                )}
            </DashboardCard>

            {/* ROW 2: System Audit and AI Forecast */}
            <DashboardCard title="System Audit & Security Feed" icon={<FaShieldAlt />}>
                <div className="audit-feed">
                    {data?.auditFeed?.map(log => (
                        <div key={log.notificationId} className={`audit-item border-start border-4 border-${log.severity === 'danger' ? 'danger' : log.severity === 'warning' ? 'warning' : 'info'} p-2 mb-2 bg-light rounded-end`}>
                            <div className="small fw-bold text-primary">{log.User?.username} <span className="text-muted fw-normal ms-2">{new Date(log.timestamp).toLocaleString()}</span></div>
                            <div className="small mt-1 text-dark">{log.message}</div>
                        </div>
                    ))}
                    {(!data?.auditFeed || data.auditFeed.length === 0) && <p className="text-muted text-center mt-">No recent activity.</p>}
                </div>
            </DashboardCard>
            
            <DashboardCard title="User Role Distribution" icon={<FaUsers />}>
                <RolePieChart data={data?.userDistribution} />
            </DashboardCard>
            
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary mb-1 d-flex align-items-center">
                        Dashboard
                        {isRefreshing && <Spinner animation="border" size="sm" variant="primary" className="ms-3" />}
                    </h2>
                    <p className="text-muted mb-0">Role: <span className="fw-bold text-dark">{user.role}</span> View</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="time-filter-group bg-white border rounded-pill shadow-sm p-1">
                        <button className={`btn btn-sm rounded-pill px-3 ${timeFilter === 7 ? 'btn-primary' : 'btn-light'}`} onClick={() => setTimeFilter(7)}>7 Days</button>
                        <button className={`btn btn-sm rounded-pill px-3 ${timeFilter === 30 ? 'btn-primary' : 'btn-light'}`} onClick={() => setTimeFilter(30)}>30 Days</button>
                    </div>
                    <div className="dashboard-date bg-white border rounded-pill px-4 py-2 shadow-sm fw-bold text-primary">
                        <FaCalendarAlt className="me-2 text-warning" /> {formatDate()}
                    </div>
                </div>
            </div>

            {user.role === 'Doctor' && renderDoctorDashboard()}
            {user.role === 'Pharmacist' && renderPharmacistDashboard()}
            {user.role === 'Admin' && renderAdminDashboard()}
        </div>
    );
}

export default React.memo(DashboardPage);