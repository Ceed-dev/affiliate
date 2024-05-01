import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { PaymentTransaction } from "../../types";

// Register the necessary chart components from Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define the component's prop types
type BarChartProps = {
  transactions: PaymentTransaction[];
};

// PaymentTransactionsChart component to display payment transactions over date
export const PaymentTransactionsChart = ({ transactions }: BarChartProps) => {
  // Define the range of dates to display in the chart
  const today = new Date();
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  // Accumulate transactions counts per day within the last month
  const transactionCounts = transactions.reduce<Record<string, number>>((acc, transaction) => {
    const transactionDate = new Date(transaction.timestamp);
    if (transactionDate >= oneMonthAgo && transactionDate <= today) {
      const key = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}-${transactionDate.getDate()}`;
      acc[key] = (acc[key] || 0) + 1; // Increment the count for each day
    }
    return acc;
  }, {});

  // Create arrays for chart labels and data points
  const labels = [];
  const dataPoints = [];
  for (let day = oneMonthAgo; day <= today; day.setDate(day.getDate() + 1)) {
    const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
    labels.push(key); // Add each day to the labels
    dataPoints.push(transactionCounts[key] || 0); // Add the count or zero if no transactions
  }

  // Chart data setup
  const data = {
    labels,
    datasets: [
      {
        label: "Number of Payment Transactions",
        data: dataPoints,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }
    ]
  };

  // Chart configuration options
  const options = {
    scales: {
      y: {
        beginAtZero: true, // Start the y-axis at 0
        ticks: {
          stepSize: 1, // Use a step size of 1 to show whole numbers only
          precision: 0 // No decimal places in y-axis ticks
        }
      }
    },
    plugins: {
      legend: {
        onClick: () => {} // Disable the default click event on legend items
      }
    }
  };

  return <Bar data={data} options={options} />;
};