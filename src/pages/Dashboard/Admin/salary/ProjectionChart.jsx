// components/salary/ProjectionChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProjectionChart = ({ projections }) => {
  const data = {
    labels: projections.map(p => p.month),
    datasets: [
      {
        label: 'Base Pay',
        data: projections.map(p => p.basePay),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Final Pay',
        data: projections.map(p => p.finalPay),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Salary Projections for Next 12 Months',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <Bar options={options} data={data} />
    </div>
  );
};

export default ProjectionChart;