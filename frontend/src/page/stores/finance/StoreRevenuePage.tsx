import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Select, Button, Tag, message } from "antd";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { CheckCircleFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Store } from "../../../type/store.type";
import { createPayout, getStoreByUserId } from "../../../api/store.api";
import { STATUS_MAP, TYPE_USER } from "../../../utils/constant";
import { useNavigate } from "react-router-dom";
import { RevenueDataChart } from "../../../type/statistic.type";
import {
  getRevenueChartData,
  getStoresRevenueStats,
} from "../../../api/statistic.api";
import { Order, OrderDetails } from "../../../type/order.type";
import { getOrders } from "../../../api/order.api";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const StoreRevenuePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [store, setStore] = useState<Store>();
  const [revenueFilter, setRevenueFilter] = useState<string>("monthly");
  const [settlementCycle, setSettlementCycle] = useState<string>("monthly");
  const [revenueDataChart, setRevenueDataChart] = useState<RevenueDataChart[]>(
    []
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenue, setRevenue] = useState<{
    totalRevenue: number;
    averageMonthlyRevenue: number;
  }>({
    totalRevenue: 0,
    averageMonthlyRevenue: 0,
  });
  const [reload, setReload] = useState<boolean>(false);
  useEffect(() => {
    if (!user._id) return;
    if (user.role !== TYPE_USER.sales) navigate("/");
    const fetchData = async () => {
      const data = await getStoreByUserId(user._id);
      if (data) {
        setStore(data);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchRevenueDataChart = async () => {
      if (!store?._id) return;
      try {
        const data = await getRevenueChartData(revenueFilter, store._id);

        setRevenueDataChart(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRevenueDataChart();
  }, [store?._id, revenueFilter, reload]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!store?._id) return;
      try {
        const data = await getOrders({
          storeId: store._id,
          settled: false,
          status: STATUS_MAP.completed.value,
        });
        setOrders(data.orders);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrders();
  }, [store?._id, reload]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!store?._id) return;
      const data = await getStoresRevenueStats(store._id);
      setRevenue({
        totalRevenue: data.totalRevenue,
        averageMonthlyRevenue: data.averageMonthlyRevenue,
      });
    };
    fetchStats();
  }, [store?._id, reload]);

  const handlePayout = async () => {
    if (!store?._id) {
      message.error("Không tìm thấy cửa hàng!");
      return;
    }
    await createPayout(store._id);
    message.success("Thành công kết toán!");
    setReload(!reload);
  };

  const calculateOrderRevenue = (order: Order) => {
    const totalProduct = order.orderDetails.reduce(
      (prev, cur) =>
        prev + cur.price * cur.quantity * (1 - (cur?.discount || 0)),
      0
    );

    const couponValue = order.coupon
      ? order.coupon.type === "fixed"
        ? order.coupon.value || 0
        : (order.coupon.value || 0) *
          order.orderDetails.reduce(
            (prev, cur) =>
              prev + cur.price * cur.quantity * (1 - (cur?.discount || 0)),
            0
          )
      : 0;

    const totalFee =
      order.fees.commission + order.fees.transaction + order.fees.service;

    return totalProduct - couponValue - totalFee;
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Số sản phẩm",
      dataIndex: "orderDetails",
      key: "orderDetails",
      ellipsis: true,
      align: "center" as const,
      render: (orderDetails: OrderDetails[]) => orderDetails.length || 0,
    },
    {
      title: "Tiền hàng",
      ellipsis: true,
      align: "center" as const,
      render: (record: Order) => (
        <span>
          {record.orderDetails
            .reduce(
              (prev, cur) =>
                prev + cur.price * cur.quantity * (1 - (cur?.discount || 0)),
              0
            )
            .toLocaleString("vi-VN")}{" "}
          đ
        </span>
      ),
    },
    {
      title: "Giảm giá",
      sorter: true,
      ellipsis: true,
      align: "center" as const,
      render: (record: Order) => (
        <span>
          {" "}
          -{" "}
          {record.coupon
            ? record.coupon.type === "fixed"
              ? record.coupon.value || 0
              : (record.coupon.value || 0) *
                record.orderDetails.reduce(
                  (prev, cur) =>
                    prev +
                    cur.price * cur.quantity * (1 - (cur?.discount || 0)),
                  0
                )
            : 0}{" "}
          đ
        </span>
      ),
    },
    {
      title: "Phí giao dịch",
      sorter: true,
      width: 120,
      ellipsis: true,
      align: "center" as const,
      render: (record: Order) => (
        <span style={{ fontWeight: "bold" }}>
          {(
            record.fees.commission +
            record.fees.transaction +
            record.fees.service
          ).toLocaleString("vi-VN")}{" "}
          đ
        </span>
      ),
    },
    {
      title: "Doanh thu đơn hàng",
      sorter: true,
      width: 120,
      ellipsis: true,
      align: "center" as const,
      render: (record: Order) => (
        <span style={{ fontWeight: "bold" }}>
          {calculateOrderRevenue(record).toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      render: (status: string) => {
        const statusInfo = STATUS_MAP[status as keyof typeof STATUS_MAP];
        return <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>;
      },
    },
  ];

  const chartData = {
    labels: revenueDataChart.map((data) => data.time.toString()),
    datasets: [
      {
        label: "Doanh thu theo năm",
        data: revenueDataChart.map(
          (data) =>
            data.revenue -
            data.totalCommission -
            data.totalTransaction -
            data.totalService
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <>
      <Row gutter={[16, 16]} style={{ margin: "10px 20px" }}>
        <Col span={24}>
          <Card
            title="Phân tích doanh thu"
            styles={{
              header: {
                textAlign: "center",
                fontSize: "25",
                textTransform: "capitalize",
              },
              body: {
                padding: "2px 0",
                backgroundColor: "red",
              },
            }}
          />
        </Col>
        <Col span={6}>
          <Card
            title="Biểu đồ doanh thu"
            style={{ marginBottom: 20, fontSize: 20, textAlign: "center" }}
          >
            <Select
              style={{ width: "100%" }}
              value={revenueFilter}
              onChange={setRevenueFilter}
            >
              <Select.Option value="monthly">Hàng tháng</Select.Option>
              <Select.Option value="quarterly">Hàng quý</Select.Option>
              <Select.Option value="yearly">Hàng năm</Select.Option>
            </Select>
          </Card>
          <Card
            title="Tổng doanh thu"
            style={{ marginBottom: 20, textAlign: "center" }}
          >
            <strong>{revenue.totalRevenue.toLocaleString("vi-VN")} VNĐ</strong>
          </Card>
          <Card
            title="Doanh thu bình quân tháng"
            style={{ marginBottom: 20, textAlign: "center" }}
          >
            <strong>
              {revenue.averageMonthlyRevenue.toLocaleString("vi-VN")} VNĐ
            </strong>
          </Card>
        </Col>
        <Col span={18}>
          <Card title="Biểu đồ doanh thu">
            <Bar data={chartData} />
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="Thông tin đơn hàng"
            styles={{
              header: {
                textAlign: "center",
                fontSize: "25",
                textTransform: "capitalize",
              },
              body: {
                padding: "2px 0",
                backgroundColor: "red",
              },
            }}
          />
        </Col>
        <Col span={18}>
          <Card title="Danh sách đơn hàng chưa rút tiền">
            <Table dataSource={orders} columns={columns} rowKey="orderId" />
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title="Số tiền đơn hàng chưa kết toán"
            style={{ textAlign: "center" }}
          >
            <strong>
              {orders
                .reduce((prev, cur) => prev + calculateOrderRevenue(cur), 0)
                .toLocaleString("vi-VN")}{" "}
              VNĐ
            </strong>
            <br />
            <Button
              style={{ marginTop: 15 }}
              icon={<CheckCircleFilled style={{ color: "green" }} />}
              onClick={() => handlePayout()}
            >
              Kết toán ngay
            </Button>
          </Card>
          <Card
            title="Thời hạn kết toán"
            style={{ textAlign: "center", marginTop: 20 }}
          >
            <Select
              style={{ width: "100%", marginBottom: 15 }}
              value={settlementCycle}
              onChange={setSettlementCycle}
            >
              <Select.Option value="monthly">Hàng tháng</Select.Option>
              <Select.Option value="weekly">Hàng tuần</Select.Option>
            </Select>
            <Button>Lưu</Button>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default StoreRevenuePage;
