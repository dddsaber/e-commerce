import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Đăng ký các thành phần cần thiết cho biểu đồ Line
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart: React.FC = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Sales",
        data: [50, 70, 90, 120, 110],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        tension: 0.4, // Làm mượt đường
      },
      {
        label: "Revenue",
        data: [3000, 5000, 7000, 9000, 8000],
        borderColor: "#2fc25b",
        backgroundColor: "rgba(47, 194, 91, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Sales & Revenue Overview" },
    },
  };

  return <Line data={data} options={options} />;
};

export default Chart;
