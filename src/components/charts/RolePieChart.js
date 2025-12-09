import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function RolePieChart({ data }) {
    const chartData = {
        labels: data.map(item => item.role),
        datasets: [
            {
                label: '# of Users',
                data: data.map(item => item.count),
                backgroundColor: [
                    '#043873',
                    '#1569caff',
                    '#5ea8fdff',
                    'rgba(153, 102, 255, 0.8)',
                ],
                borderColor: [
                    '#043873',
                    '#1569caff',
                    '#5ea8fdff',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'User Role Distribution' },
        },
    };

    return <Pie data={chartData} options={options} />;
}

export default RolePieChart;