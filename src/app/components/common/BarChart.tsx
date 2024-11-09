import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataset } from "chart.js";
import { PaymentTransaction, ConversionLog, ClickData } from "../../types";

// Register necessary chart components from Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Generates a random color for chart bars.
 * Used for distinguishing between different datasets visually.
 */
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
  };
};

// Define the component's prop types
type BarChartProps = {
  dataMap: Record<string, (PaymentTransaction | ConversionLog | ClickData)[]>;
  timeRange: "week" | "month";
};

/**
 * BarChart Component
 *
 * Displays bar chart data over a specified date range (week or month).
 * @param {dataMap} - Object containing data grouped by categories (e.g., conversions, clicks)
 * @param {timeRange} - The time range to display: "week" (last 7 days) or "month" (last 30 days)
 */
export const BarChart: React.FC<BarChartProps> = ({ dataMap, timeRange }) => {
  // Calculate the date range based on timeRange prop
  const today = new Date();
  const rangeStartDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - (timeRange === "week" ? 7 : 30)
  );

  // Generate labels for each date in the selected range
  const labels: string[] = [];
  const datasets: ChartDataset<"bar", number[]>[] = [];

  // Populate labels with each date within the range
  for (let day = new Date(rangeStartDate); day <= today; day.setDate(day.getDate() + 1)) {
    const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
    labels.push(key);
  }

  // Process each dataset in dataMap and prepare for chart display
  Object.entries(dataMap).forEach(([title, transactions]) => {
    // Count occurrences per day within the range
    const transactionCounts = transactions.reduce<Record<string, number>>((acc, transaction) => {
      const transactionDate = new Date(transaction.timestamp);
      if (transactionDate >= rangeStartDate && transactionDate <= today) {
        const key = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}-${transactionDate.getDate()}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    // Map data points to match each date label
    const dataPoints = labels.map(label => transactionCounts[label] || 0);

    // Set color based on the dataset title
    const color = title === "Clicks" ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 1)";
    const borderColor = title === "Clicks" ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 1)";

    // Create a dataset with a random color for each entry
    datasets.push({
      label: title,
      data: dataPoints,
      backgroundColor: color,
      borderColor: borderColor,
      borderWidth: 1,
    });
  });

  // Chart data configuration
  const data = {
    labels,
    datasets,
  };

  // Chart options for display customization
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    barPercentage: 1.0,       // Remove space between bars within a category
    plugins: {
      legend: { 
        display: true,
        position: "top" as const, // Keep the legend at the top of the chart
        align: "end" as const,   // Align labels to the right within the legend box
        labels: {
          padding: 20,          // Adjust padding if needed
        },
      },
      tooltip: { enabled: true },
    },
  };

  return <Bar data={data} options={options} />;
};