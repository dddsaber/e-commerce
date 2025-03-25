import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Spin } from "antd";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import LatestOrders from "../../../components/dashboard/LatestOrders";

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Interface định nghĩa kiểu dữ liệu
interface StoreData {
  totalPendingOrders: number;
  totalConfirmedOrders: number;
  totalCancelledOrders: number;
  totalBlockedProducts: number;
  revenueByMonth: { month: string; revenue: number }[];
  orderStatus: { completed: number; pending: number; cancelled: number };
}

// Giả lập API fetch data
const fetchStoreData = async (): Promise<StoreData> => {
  return {
    totalPendingOrders: 15,
    totalConfirmedOrders: 120,
    totalCancelledOrders: 8,
    totalBlockedProducts: 3,
    revenueByMonth: [
      { month: "Jan", revenue: 1000 },
      { month: "Feb", revenue: 1500 },
      { month: "Mar", revenue: 1200 },
      { month: "Apr", revenue: 1800 },
      { month: "May", revenue: 1400 },
      { month: "Jun", revenue: 2000 },
    ],
    orderStatus: {
      completed: 120,
      pending: 15,
      cancelled: 8,
    },
  };
};

const StoreManagement: React.FC = () => {
  const [data, setData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      const result = await fetchStoreData();
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );

  // Cấu hình dữ liệu biểu đồ đường (Line Chart)
  const lineChartData = {
    labels: data?.revenueByMonth.map((item) => item.month),
    datasets: [
      {
        label: "Doanh thu",
        data: data?.revenueByMonth.map((item) => item.revenue),
        borderColor: "#8884d8",
        backgroundColor: "rgba(136, 132, 216, 0.5)",
        borderWidth: 3,
      },
    ],
  };

  // Cấu hình dữ liệu biểu đồ tròn (Doughnut Chart)
  const doughnutChartData = {
    labels: ["Đã hoàn thành", "Chờ xử lý", "Đã hủy"],
    datasets: [
      {
        data: data ? Object.values(data.orderStatus) : [],
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
        hoverBackgroundColor: ["#2980b9", "#f1c40f", "#e74c3c"],
      },
    ],
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>📊 Quản lý cửa hàng</Typography.Title>

      {/* Thống kê nhanh */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="Chờ lấy hàng" value={data?.totalPendingOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đã xử lý" value={data?.totalConfirmedOrders} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Trả hàng / Hủy"
              value={data?.totalCancelledOrders}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm bị tạm khóa"
              value={data?.totalBlockedProducts}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="📈 Doanh thu theo tháng">
            <Line data={lineChartData} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="🛒 Trạng thái đơn hàng">
            <Doughnut data={doughnutChartData} />
          </Card>
        </Col>
      </Row>

      {/* Đơn hàng gần đây */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="📋 Đơn hàng gần đây">
            <LatestOrders />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="📋 Đơn hàng gần đây">
            <LatestOrders />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StoreManagement;
