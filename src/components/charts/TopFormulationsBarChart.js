import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function TopFormulationsBarChart({ data }) {
    if (!data || data.length === 0) return <p className="text-center text-muted">No prescriptions found.</p>;

    const chartData = {
        labels: data.map(item => item.Dilution?.name || 'Unknown'),
        datasets: [{
            label: 'Times Prescribed',
            data: data.map(item => item.count),
            backgroundColor: '#0dcaf0',
            borderRadius: 6,
        }]
    };

    const options = {
        indexAxis: 'y', // Makes it horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
    };

    return <div style={{ height: '300px' }}><Bar data={chartData} options={options} /></div>;
}

export default React.memo(TopFormulationsBarChart);