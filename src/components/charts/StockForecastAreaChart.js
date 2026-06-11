import React from 'react';
import { Line } from 'react-chartjs-2';

function StockForecastAreaChart({ data }) {
    if (!data || data.length === 0) return <p className="text-center text-muted">AI is analyzing inventory...</p>;

    const chartData = {
        labels: data.map(item => item.name),
        datasets: [{
            label: 'Estimated Days Remaining',
            data: data.map(item => item.daysRemaining),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            fill: true,
            tension: 0.3
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Days to Empty' } } }
    };

    return <div style={{ height: '300px' }}><Line data={chartData} options={options} /></div>;
}

export default React.memo(StockForecastAreaChart);