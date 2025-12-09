import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function JobcardBarChart({ data }) {
    const chartData = {
        labels: data.map(item => format(new Date(item.date), 'dd/MM')),
        datasets: [
            {
                label: 'Approved',
                data: data.map(item => parseInt(item.approvedCount, 10)),
                backgroundColor: '#043873d8', // Primary color
            },
            {
                label: 'Rejected',
                data: data.map(item => parseInt(item.rejectedCount, 10)),
                backgroundColor: 'rgba(180, 3, 21, 0.8)', // Danger color
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Approved vs. Rejected Jobcards' },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true },
        },
    };

    return <Bar data={chartData} options={options} />;
}

export default JobcardBarChart;