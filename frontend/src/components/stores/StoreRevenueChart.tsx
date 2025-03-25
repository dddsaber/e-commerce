import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card, Col, Row, Statistic } from "antd";
import { StoreRevenue } from "../../type/statistic.type";

// Đăng ký các thành phần của Chart.js
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);
interface StoreRevenueChartProps {
  data: StoreRevenue[];
}
const StoreRevenueChart: React.FC<StoreRevenueChartProps> = ({ data }) => {
  // Tính revenue
  const processedData = data.map((store) => ({
    name: store.name,
    revenue:
      store.total -
      store.totalCommission -
      store.totalTransaction -
      store.totalService,
  }));

  // Sắp xếp theo revenue giảm dần
  processedData.sort((a, b) => b.revenue - a.revenue);

  // Lấy top 9, các cửa hàng còn lại gộp thành "Others"
  const topStores = processedData.slice(0, 9);
  const othersTotal = processedData
    .slice(9)
    .reduce((sum, store) => sum + store.revenue, 0);
  if (othersTotal > 0) {
    topStores.push({ name: "Others", revenue: othersTotal });
  }

  // Chuẩn bị dữ liệu cho biểu đồ

  const totalRevenue = topStores.reduce((sum, store) => sum + store.revenue, 0);
  const chartData = {
    labels: topStores.map((store) => store.name),
    datasets: [
      {
        data: topStores.map((store) => store.revenue),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#8E5EA2",
          "#3CBA9F",
          "#568efe",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#8E5EA2",
          "#3CBA9F",
          "#568efe",
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "right" as const, // Hiển thị legend bên phải
        labels: {
          boxWidth: 12, // Kích thước ô màu
          padding: 15,
          margin: 10,
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (tooltipItem: any) => {
            const revenue = tooltipItem.raw;
            const percentage = ((revenue / totalRevenue) * 100).toFixed(2);
            return `${tooltipItem.label}: ${percentage}%`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        formatter: (value: number) => {
          const percentage = ((value / totalRevenue) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
    },
  };

  //Du lieu phan tich
  const totalOrdersRevenue = data.reduce((prev, cur) => prev + cur.total, 0);
  const totalCommissionRevenue = data.reduce(
    (prev, cur) => prev + cur.totalCommission,
    0
  );
  const totalServiceRevenue = data.reduce(
    (prev, cur) => prev + cur.totalService,
    0
  );
  const totalTransactionRevenue = data.reduce(
    (prev, cur) => prev + cur.totalTransaction,
    0
  );
  const totalFees =
    totalCommissionRevenue + totalTransactionRevenue + totalServiceRevenue;

  return (
    <Row gutter={[12, 12]} style={{ margin: "15px 0" }}>
      <Col span={16}>
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "16px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "400px", height: "400px" }}>
              <Pie data={chartData} options={options} />
            </div>
          </div>
        </div>
      </Col>
      <Col span={4}>
        <Card style={{ margin: "10px 0", textAlign: "center", width: "100%" }}>
          <Statistic
            title="Tổng giá trị đơn hàng"
            value={totalOrdersRevenue.toLocaleString("vi-VN")}
            suffix="VND"
            valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
          />
        </Card>
        <Card style={{ margin: "10px 0", textAlign: "center", width: "100%" }}>
          <Statistic
            title="Tổng doanh thu cửa hàng"
            value={(totalOrdersRevenue - totalFees).toLocaleString("vi-VN")}
            suffix="VND"
            valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
          />
        </Card>
      </Col>
      <Col span={4}>
        <Card style={{ margin: "10px 0", textAlign: "center" }}>
          <Statistic
            title="Phí thanh toán"
            value={totalTransactionRevenue.toLocaleString("vi-VN")}
            suffix="VND"
            valueStyle={{ fontSize: "14px" }}
          />
        </Card>
        <Card style={{ margin: "10px 0", textAlign: "center" }}>
          <Statistic
            title="Phí cố định"
            value={totalCommissionRevenue.toLocaleString("vi-VN")}
            suffix="VND"
            valueStyle={{ fontSize: "14px" }}
          />
        </Card>
        <Card style={{ margin: "10px 0", textAlign: "center" }}>
          <Statistic
            title="Phí dịch vụ"
            value={totalServiceRevenue.toLocaleString("vi-VN")}
            suffix="VND"
            valueStyle={{ fontSize: "14px" }}
          />
        </Card>
        <Card style={{ margin: "10px 0", textAlign: "center" }}>
          <Statistic
            title="Tổng phí giao dịch"
            value={totalFees.toLocaleString("vi-VN")}
            suffix="VND"
            valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StoreRevenueChart;
