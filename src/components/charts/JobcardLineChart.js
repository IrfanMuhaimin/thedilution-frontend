import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { format, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function JobcardLineChart({ data }) {
    if (!data || data.length === 0) return <p className="text-center text-muted">No data available.</p>;

    const chartData = {
        labels: data.map(item => format(parseISO(item.date), 'dd MMM')),
        datasets: [
            {
                label: 'Requested',
                data: data.map(item => item.created),
                borderColor: '#f59e0b', // Yellow/Gold
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Approved/Processed',
                data: data.map(item => item.approved),
                borderColor: '#043873', // Primary Blue
                backgroundColor: 'rgba(4, 56, 115, 0.1)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    };

    return <div style={{ height: '300px' }}><Line data={chartData} options={options} /></div>;
}

export default React.memo(JobcardLineChart);