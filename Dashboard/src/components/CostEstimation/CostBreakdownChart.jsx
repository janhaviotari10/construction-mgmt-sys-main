import React from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './CostBreakdownChart.css';

const CostBreakdownChart = ({ data, onDownload }) => {
  const labels = Object.keys(data);
  const values = Object.values(data);
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#E74C3C', '#3498DB', '#F1C40F', '#1ABC9C', '#9B59B6', '#F39C12', '#D2691E'
  ];

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="chart-container" id="cost-breakdown-chart">
      <div className="chart-header">
        <h3>Cost Breakdown</h3>
        
      </div>
      <div className="chart-content">
        <div className="field-list">
          <ul>
            {labels.map((label, index) => (
              <li key={index}>
                <div className="field-color" style={{ backgroundColor: colors[index] }}></div>
                {label} - {values[index].toFixed(2)} INR
              </li>
            ))}
          </ul>
        </div>
        <div className="chart-wrapper">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownChart;