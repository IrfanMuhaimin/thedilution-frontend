import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusPipelineDoughnut({ data }) {
    if (!data || data.length === 0) return <p className="text-center text-muted">No active jobcards.</p>;

    // Ensure we map standard colors
    const colorMap = {
        'Pending': '#64748b', 'Approved': '#043873', 'Processing': '#0dcaf0',
        'Completed': '#10b981', 'Rejected': '#ef4444'
    };

    const chartData = {
        labels: data.map(d => d.status),
        datasets: [{
            data: data.map(d => d.count),
            backgroundColor: data.map(d => colorMap[d.status] || '#ccc'),
            borderWidth: 2,
        }]
    };

    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

    return <div style={{ height: '300px' }}><Doughnut data={chartData} options={options} /></div>;
}

export default React.memo(StatusPipelineDoughnut);