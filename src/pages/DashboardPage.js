import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import { 
    FaTachometerAlt, FaUsers, FaServer, FaClipboardList, 
    FaChartPie, FaCogs, FaCalendarAlt, FaExclamationTriangle,
    FaArrowUp, FaArrowDown, FaCheckCircle, FaClock, FaChartBar
} from 'react-icons/fa';
import * as dashboardService from '../services/dashboardService';
import RolePieChart from '../components/charts/RolePieChart';
import HardwareDoughnutChart from '../components/charts/HardwareDoughnutChart';
import JobcardBarChart from '../components/charts/JobcardBarChart';
import '../styles/Dashboard.css';

function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeFilter, setTimeFilter] = useState(7);

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

    // Format current date
    const formatDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    // Calculate stats from dashboard data
    const getStats = () => {
        if (!dashboardData) return [];
        
        const totalUsers = dashboardData.userDistribution?.reduce((acc, item) => acc + item.value, 0) || 0;
        const totalMachines = dashboardData.machineDistribution?.reduce((acc, item) => acc + item.value, 0) || 0;
        const activeMachines = dashboardData.activeMachines?.length || 0;
        const totalJobcards = dashboardData.dilutionStats?.reduce((acc, item) => 
            acc + (item.completed || 0) + (item.pending || 0), 0) || 0;


    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    <div className="dashboard-spinner"></div>
                    <span className="dashboard-loading-text">Loading dashboard data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-error">
                    <FaExclamationTriangle className="dashboard-error-icon" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    const stats = getStats();

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-title-section">
                        {/* <div className="dashboard-icon">
                            <FaTachometerAlt />
                        </div> */}
                        <div>
                            <h1 className="dashboard-title">Dashboard</h1>
                            <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
                        </div>
                    </div>
                    <div className="dashboard-date">
                        <FaCalendarAlt className="dashboard-date-icon" />
                        <span className="dashboard-date-text">{formatDate()}</span>
                    </div>
                </div>
            </div>

            

            {/* Charts Row */}
            <div className="dashboard-charts">
                {/* Role Distribution */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div className="chart-card-title">
                            <div className="chart-card-title-icon">
                                <FaChartPie />
                            </div>
                            <h5>User Distribution</h5>
                        </div>
                    </div>
                    <div className="chart-card-body">
                        {dashboardData && <RolePieChart data={dashboardData.userDistribution} />}
                    </div>
                </div>

                {/* Hardware Distribution */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div className="chart-card-title">
                            <div className="chart-card-title-icon">
                                <FaCogs />
                            </div>
                            <h5>Hardware Status</h5>
                        </div>
                    </div>
                    <div className="chart-card-body">
                        {dashboardData && <HardwareDoughnutChart data={dashboardData.machineDistribution} />}
                    </div>
                </div>

                {/* Active Machines */}
                <div className="machines-card">
                    <div className="machines-card-header">
                        <h5>
                            <FaClock style={{ marginRight: '0.5rem' }} />
                            Active Machines
                        </h5>
                        <span className="machines-count">
                            {dashboardData?.activeMachines?.length || 0} Running
                        </span>
                    </div>
                    <div className="machines-list">
                        {dashboardData && dashboardData.activeMachines?.length > 0 ? (
                            dashboardData.activeMachines.map(machine => (
                                <div key={machine.hardwareId} className="machine-item">
                                    <div className="machine-status"></div>
                                    <div className="machine-info">
                                        <div className="machine-name">{machine.name}</div>
                                        <div className="machine-jobs">
                                            Processing {machine.Jobcards?.length || 0} jobcard(s)
                                        </div>
                                    </div>
                                    <span className="machine-badge">Active</span>
                                </div>
                            ))
                        ) : (
                            <div className="machines-empty">
                                <FaServer className="machines-empty-icon" />
                                <p>No machines are currently active</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Jobcard Statistics (Full Width) */}
            <div className="jobcard-stats-card">
                <div className="jobcard-stats-header">
                    <div className="jobcard-stats-title">
                        <div className="jobcard-stats-icon">
                            <FaChartBar />
                        </div>
                        <h5>Jobcard Statistics</h5>
                    </div>
                    <div className="time-filter-group">
                        <button 
                            className={`time-filter-btn ${timeFilter === 1 ? 'active' : ''}`}
                            onClick={() => setTimeFilter(1)}
                        >
                            Daily
                        </button>
                        <button 
                            className={`time-filter-btn ${timeFilter === 7 ? 'active' : ''}`}
                            onClick={() => setTimeFilter(7)}
                        >
                            Weekly
                        </button>
                        <button 
                            className={`time-filter-btn ${timeFilter === 30 ? 'active' : ''}`}
                            onClick={() => setTimeFilter(30)}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
                <div className="jobcard-stats-body">
                    {dashboardData && <JobcardBarChart data={dashboardData.dilutionStats} />}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;