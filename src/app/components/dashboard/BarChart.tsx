import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataset } from "chart.js";
import { PaymentTransaction, ConversionLog } from "../../types";

// Register the necessary chart components from Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  dataMap: Record<string, (PaymentTransaction | ConversionLog)[]>;
};

// BarChart component to display data over date
export const BarChart: React.FC<BarChartProps> = ({ dataMap }) => {
  // Define the range of dates to display in the chart
  const today = new Date();
  const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const labels: string[] = [];
  const datasets: ChartDataset<"bar", number[]>[] = [];

  for (let day = new Date(oneMonthAgo); day <= today; day.setDate(day.getDate() + 1)) {
    const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
    labels.push(key);
  }

  Object.entries(dataMap).forEach(([title, transactions], index) => {
    const transactionCounts = transactions.reduce<Record<string, number>>((acc, transaction) => {
      const transactionDate = new Date(transaction.timestamp);
      if (transactionDate >= oneMonthAgo && transactionDate <= today) {
        const key = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}-${transactionDate.getDate()}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    const dataPoints = labels.map(label => transactionCounts[label] || 0);

    datasets.push({
      label: title,
      data: dataPoints,
      ...getRandomColor(),
      borderWidth: 1,
    });
  });

  const data = {
    labels,
    datasets,
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
  };

  return <Bar data={data} options={options} />;
};