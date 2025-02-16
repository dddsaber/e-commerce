import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card } from "antd";

// Đăng ký các thành phần cần thiết cho biểu đồ
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart: React.FC = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Orders",
        data: [100, 120, 150, 180, 200],
        backgroundColor: "#fa541c",
      },
      {
        label: "Customers",
        data: [50, 80, 90, 110, 130],
        backgroundColor: "#722ed1",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 200,
        ticks: {
          stepSize: 20, // Khoảng cách giữa các giá trị trên trục Y
        },
      },
    },
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Orders & Customers Overview" },
    },
  };

  return (
    <Card
      style={{ height: 500 }}
      hoverable
      title={"Users and Orders Chart"}
      styles={{
        header: {
          color: "#274D60",
          fontSize: 25,
          backgroundColor: "#fafafa",
        },
      }}
    >
      <Bar data={data} options={options} />
    </Card>
  );
};

export default BarChart;
