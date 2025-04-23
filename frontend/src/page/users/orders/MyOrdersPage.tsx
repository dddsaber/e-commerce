import React, { useEffect, useState } from "react";
import { Order } from "../../../type/order.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getOrders } from "../../../api/order.api";
import OrderCard from "../../../components/orders/OrderCard";
import { Card, Col, Row, Skeleton } from "antd";
import "../../../components/layout/TableSkeleton.css";

const MyOrdersPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>();
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) return;
      setLoading(true);
      const { orders, totalOrders } = await getOrders({ userId: user._id });
      setOrders(orders);
      setTotalOrders(totalOrders);
      setLoading(false);
    };
    fetchData();
  }, [user, reload]);
  return !loading ? (
    <>
      <p style={{ textAlign: "right" }}>
        Tổng số đơn hàng đã mua: {totalOrders}
      </p>
      {orders?.map((order) => (
        <OrderCard
          order={order}
          userId={user._id}
          reload={reload}
          setReload={setReload}
        />
      ))}
    </>
  ) : (
    <>
      <p style={{ textAlign: "right" }}>Tổng số đơn hàng đã mua:</p>
      <Card
        title={
          <Row gutter={[12, 12]} align="middle">
            <Col span={4}>
              <Skeleton.Input style={{ width: "80%" }} active />
            </Col>
            <Col span={1}></Col>
            <Col span={2}>
              <Skeleton.Button active style={{ width: "80%" }} />
            </Col>
            <Col span={2}>
              <Skeleton.Button active style={{ width: "80%" }} />
            </Col>
            <Col span={9} />
            <Col span={6} style={{ textAlign: "right" }}>
              <Skeleton.Input style={{ width: "80%" }} active />
            </Col>
          </Row>
        }
        style={{ marginBottom: 20 }}
      >
        {/* Hình ảnh & bảng đơn hàng */}
        <Row>
          <Col span={4}>
            <Skeleton.Image active style={{ width: 80, height: 80 }} />
          </Col>
          <Col span={20} style={{ alignItems: "center" }}>
            <Skeleton paragraph={{ rows: 2 }} active />
          </Col>
          <Col span={4}>
            <Skeleton.Image active style={{ width: 80, height: 80 }} />
          </Col>
          <Col span={20} style={{ alignItems: "center" }}>
            <Skeleton paragraph={{ rows: 2 }} active />
          </Col>
        </Row>

        {/* Nút hành động */}
        <Row gutter={[16, 16]} style={{ marginTop: "40px" }}>
          <Col span={16}></Col>
          <Col span={4}>
            <Skeleton.Button active size="large" style={{ width: "100%" }} />
          </Col>
          <Col span={4}>
            <Skeleton.Button active size="large" style={{ width: "100%" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Row gutter={[12, 12]} align="middle">
            <Col span={4}>
              <Skeleton.Input style={{ width: "80%" }} active />
            </Col>
            <Col span={1}></Col>

            <Col span={2}>
              <Skeleton.Button active style={{ width: "80%" }} />
            </Col>
            <Col span={2}>
              <Skeleton.Button active style={{ width: "80%" }} />
            </Col>
            <Col span={9} />
            <Col span={6} style={{ textAlign: "right" }}>
              <Skeleton.Input style={{ width: "80%" }} active />
            </Col>
          </Row>
        }
        style={{ marginBottom: 20 }}
      >
        {/* Hình ảnh & bảng đơn hàng */}
        <Row>
          <Col span={4}>
            <Skeleton.Image active style={{ width: 80, height: 80 }} />
          </Col>
          <Col span={20} style={{ alignItems: "center" }}>
            <Skeleton paragraph={{ rows: 2 }} active />
          </Col>
        </Row>

        {/* Nút hành động */}
        <Row gutter={[16, 16]} style={{ marginTop: "40px" }}>
          <Col span={16}></Col>
          <Col span={4}>
            <Skeleton.Button active size="large" style={{ width: "100%" }} />
          </Col>
          <Col span={4}>
            <Skeleton.Button active size="large" style={{ width: "100%" }} />
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default MyOrdersPage;
