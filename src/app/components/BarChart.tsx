import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  const labels = [];
  const dataPoints = [];

  for (let year = 2020; year <= 2022; year++) {
    for (let month = 1; month <= 12; month++) {
      labels.push(`${year}/${month}`);
      dataPoints.push(Math.floor(Math.random() * 20));
    }
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Affiliate sign ups",
        data: dataPoints,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
