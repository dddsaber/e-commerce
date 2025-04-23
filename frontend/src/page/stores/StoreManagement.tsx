import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, message, Typography } from "antd";
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
import { getOrderStatusCount } from "../../api/order.api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Store } from "../../type/store.type";
import { getStoreByUserId } from "../../api/store.api";
import { convertChartData } from "../../utils/handle_format_func";
import { getRevenueChartData } from "../../api/statistic.api";
import { RevenueDataChart } from "../../type/statistic.type";

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

const StoreManagement: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [store, setStore] = useState<Store>();
  const [loading, setLoading] = useState<boolean>(true);
  const [orderStatusCount, setOrderStatusCount] = useState<{
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    completed: number;
    cancelled: number;
  }>({
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  });

  const [revenueDataChart, setRevenueDataChart] = useState<RevenueDataChart[]>(
    []
  );

  useEffect(() => {
    const fetchRevenueDataChart = async () => {
      if (!store?._id) return;
      try {
        const data = await getRevenueChartData("monthly", store._id);
        setRevenueDataChart(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (store?._id) fetchRevenueDataChart();
  }, [store?._id]);

  const fetchStore = async () => {
    if (!user._id) return;
    setLoading(true);
    const storeData = await getStoreByUserId(user._id);
    setStore(storeData);
    setLoading(false);
  };

  useEffect(() => {
    fetchStore();
  }, [user._id]);

  useEffect(() => {
    async function fetchData() {
      if (!store?._id) {
        message.error("Không tìm thấy cửa hàng!");
        return;
      }

      const orderStatusData = await getOrderStatusCount(store._id);
      setOrderStatusCount(orderStatusData);
      setLoading(false);
    }

    if (store?._id) {
      fetchData();
    }
  }, [store?._id]);

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );

  // Dữ liệu cho biểu đồ Line
  const lineChartData = {
    labels: revenueDataChart.map((item) => item.time),
    datasets: [
      {
        label: "Doanh thu",
        data: revenueDataChart.map((item) => item.revenue),
        borderColor: "#4CAF50", // Màu đường
        backgroundColor: "rgba(76, 175, 80, 0.2)", // Màu nền
        fill: true,
        tension: 0.4,
      },

      {
        label: "Phí giao dịch",
        data: revenueDataChart.map(
          (item) =>
            item.totalTransaction + item.totalCommission + item.totalTransaction
        ),
        borderColor: "#2196F3", // Màu đường dịch vụ
        backgroundColor: "rgba(33, 150, 243, 0.2)", // Màu nền dịch vụ
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>📊 Quản lý cửa hàng</Typography.Title>

      {/* Biểu đồ */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={16}>
          <Card title="📈 Doanh thu theo tháng">
            <Line data={lineChartData} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="🛒 Trạng thái đơn hàng">
            <Doughnut data={convertChartData(orderStatusCount)} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StoreManagement;
