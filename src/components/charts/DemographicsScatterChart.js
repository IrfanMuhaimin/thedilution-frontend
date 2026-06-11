import React from 'react';
import { Scatter } from 'react-chartjs-2';

function DemographicsScatterChart({ data }) {
    if (!data || data.length === 0) return <p className="text-center text-muted">No patient data available.</p>;

    const chartData = {
        datasets: [{
            label: 'Patient Profile',
            data: data.map(d => ({ x: d.age, y: d.weight })),
            backgroundColor: 'rgba(16, 185, 129, 0.6)', // Green
            borderColor: '#10b981',
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: 'Age (Years)' }, beginAtZero: true },
            y: { title: { display: true, text: 'Weight (kg)' }, beginAtZero: true }
        }
    };

    return <div style={{ height: '300px' }}><Scatter data={chartData} options={options} /></div>;
}

export default React.memo(DemographicsScatterChart);