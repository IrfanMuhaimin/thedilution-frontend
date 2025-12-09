import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function HardwareDoughnutChart({ data }) {
    const activeCount = data.find(d => d.status === true)?.count || 0;
    const inactiveCount = data.find(d => d.status === false)?.count || 0;

    const chartData = {
        labels: ['Active', 'Inactive'],
        datasets: [
            {
                label: 'Hardware Status',
                data: [activeCount, inactiveCount],
                backgroundColor: ['rgba(17, 134, 45, 1)', 'rgba(180, 3, 21, 1)'],
                borderColor: ['rgba(17, 134, 45, 1)', 'rgba(180, 3, 21, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Hardware Status Distribution' },
        },
    };

    return <Doughnut data={chartData} options={options} />;
}

export default HardwareDoughnutChart;