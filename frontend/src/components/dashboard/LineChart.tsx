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
import { Card } from "antd";

// Đăng ký các thành phần cần thiết cho biểu đồ
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart: React.FC = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
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
    scales: {
      y: {
        min: 0,
        max: 10000,
        ticks: {
          stepSize: 1000, // Khoảng cách giữa các giá trị trên trục Y
        },
      },
    },
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Revenue Overview" },
    },
  };

  return (
    <Card
      style={{ height: 500 }}
      hoverable
      title={"Revenue Chart"}
      styles={{
        header: {
          color: "#274D60",
          fontSize: 25,
          backgroundColor: "#fafafa",
        },
      }}
    >
      <Line data={data} options={options} />
    </Card>
  );
};

export default LineChart;
