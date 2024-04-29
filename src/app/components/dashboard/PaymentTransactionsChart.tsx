import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { PaymentTransaction } from "../../types";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type BarChartProps = {
  transactions: PaymentTransaction[];
};

export const PaymentTransactionsChart = ({ transactions }: BarChartProps) => {
  const today = new Date();
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const transactionCounts = transactions.reduce<Record<string, number>>((acc, transaction) => {
    const transactionDate = new Date(transaction.timestamp);
    if (transactionDate >= oneMonthAgo && transactionDate <= today) {
      const key = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}-${transactionDate.getDate()}`;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {});

  const labels = [];
  const dataPoints = [];
  for (let day = oneMonthAgo; day <= today; day.setDate(day.getDate() + 1)) {
    const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
    labels.push(key);
    dataPoints.push(transactionCounts[key] || 0);
  }

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

  const options = {
    scales: {
      y: {
        beginAtZero: true, // Start the y-axis at 0
        ticks: {
          stepSize: 1, // Set the step size of the y-axis to 1 to display only integers
          precision: 0 // Ensure the ticks are integers only
        }
      }
    },
    plugins: {
      legend: {
        onClick: () => {} // Disable hiding datasets on legend click
      }
    }
  };

  return <Bar data={data} options={options} />;
};