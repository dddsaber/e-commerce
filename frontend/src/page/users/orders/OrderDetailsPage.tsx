import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Order, OrderDetails } from "../../../type/order.type";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  message,
  Row,
  Spin,
  Steps,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { getOrderById } from "../../../api/order.api";
import { getSourceImage } from "../../../utils/handle_image_func";
import {
  MessageOutlined,
  QuestionCircleOutlined,
  ShopFilled,
  ShopOutlined,
} from "@ant-design/icons";
import { ORDER_STEP_STATUS, STATUS_MAP } from "../../../utils/constant";
import {
  formatAddress,
  formatDate,
  formatLink,
  LINK_TYPE,
} from "../../../utils/handle_format_func";
import { calculateOrderDetails } from "../../../utils/handle_status_func";

interface StepType {
  title: React.ReactNode;
  description: React.ReactNode;
}

const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        message.error("Order ID is required");
        return;
      }
      setLoading(true);
      try {
        const response = await getOrderById(orderId);
        setOrder(response);
        console.log(response);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Unknown error", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const columns = [
    {
      title: "Image",
      width: 100,
      render: (_: unknown, record: OrderDetails) => (
        <Image
          width={80}
          src={getSourceImage(record.product?.image || "")}
          alt={record.product?.name || ""}
          onClick={() =>
            navigate(formatLink(LINK_TYPE.PRODUCT, record.product?._id || ""))
          }
        />
      ),
    },
    {
      title: "SP",
      width: 500,
      render: (record: OrderDetails) => (
        <span style={{ fontWeight: "bold" }}>
          {record.product?.name} &nbsp; x{record.quantity}
        </span>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      align: "right" as const,
      render: (price: number, record: OrderDetails) => {
        const discountedPrice = record.discount
          ? price * (1 - record.discount) // Tính giá sau khi giảm
          : price;

        return (
          <div>
            {record.discount ? (
              <>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "red",
                    marginRight: "8px",
                  }}
                >
                  {price.toLocaleString("vi-VN")} đ
                </span>
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {discountedPrice.toLocaleString("vi-VN")} đ
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 500, color: "red" }}>
                {price.toLocaleString("vi-VN")} đ
              </span>
            )}
          </div>
        );
      },
    },
  ];
  const handleNavigate = () => {
    if (!order) {
      message.error(`Store not found!`);
      return;
    }
    navigate("/chat", {
      state: { userId: order.store?.userId }, // Truyền userId qua state
    });
  };

  const order_steps = ORDER_STEP_STATUS.map((item) => ({
    title: STATUS_MAP[item as keyof typeof STATUS_MAP]?.label,
    description: formatDate(
      order?.statusTimestamps![item as keyof typeof STATUS_MAP]
    ),
  }));

  const getCurrentStep = (
    order?: Order
  ): { status?: "error"; step: number } => {
    let status: "error" | undefined = undefined;
    let step = 1;

    if (!order) {
      return { status: "error", step: 0 };
    }
    if (order.status === STATUS_MAP.cancelled.label) {
      status = "error";
    }

    if (order.statusTimestamps?.confirmed) {
      step += 1;
    } else {
      return { status, step };
    }

    if (order.statusTimestamps?.shipped) {
      step += 1;
    } else {
      return { status, step };
    }

    if (order.statusTimestamps?.delivered) {
      step += 1;
    } else {
      return { status, step };
    }

    if (order.statusTimestamps?.completed) {
      step += 1;
    } else {
      return { status, step };
    }

    return { status, step };
  };
  const { status, step } = getCurrentStep(order!);

  const getDeliveryStep = (order?: Order): StepType[] => {
    const steps: StepType[] = [];

    if (!order) return steps;

    steps.push({
      title: <span>{formatDate(order.statusTimestamps?.pending)}</span>,
      description: "Đơn hàng được đặt thành công",
    });

    if (!order.statusTimestamps?.confirmed) return steps;
    steps.push({
      title: <span>{formatDate(order.statusTimestamps?.confirmed)}</span>,
      description: "Đơn hàng đã được xác nhận",
    });

    if (!order.statusTimestamps?.shipped) return steps;
    steps.push({
      title: <span>{formatDate(order.statusTimestamps?.shipped)}</span>,
      description: "Đơn hàng đã được giao cho đơn vị vận chuyển",
    });

    if (!order.delivery?.deliveryLogs?.[0]?.timestamp) return steps;
    steps.push({
      title: (
        <span>{formatDate(order.delivery.deliveryLogs[0].timestamp)}</span>
      ),
      description: `Đơn hàng đã được đưa đến ${
        order.delivery.deliveryLogs[0].warehouseInfo.name
      }, ${formatAddress(
        order.delivery.deliveryLogs[0].warehouseInfo.address
      )}`,
    });

    if (!order.delivery.deliveryLogs?.[1]?.timestamp) return steps;
    steps.push({
      title: (
        <span>{formatDate(order.delivery.deliveryLogs[1].timestamp)}</span>
      ),
      description: `Đơn hàng đã được đưa đến ${
        order.delivery.deliveryLogs[1].warehouseInfo.name
      }, ${formatAddress(
        order.delivery.deliveryLogs[1].warehouseInfo.address
      )}`,
    });

    if (!order.delivery.deliveredDate || !order.statusTimestamps.delivered)
      return steps;
    steps.push({
      title: <span>{formatDate(order.delivery.deliveredDate)}</span>,
      description: `Đơn hàng đã được giao cho khách hàng ${order.delivery.recipientName}`,
    });

    return steps;
  };
  const deliverySteps = getDeliveryStep(order).reverse();

  return loading ? (
    <Spin size="large" />
  ) : order ? (
    <div>
      <Card
        title={
          <>
            <Row gutter={[12, 12]}>
              <Col span={3}>
                <Button
                  type="text"
                  style={{ fontWeight: "bold", textTransform: "uppercase" }}
                  onClick={() => navigate("/account/my-orders")}
                >
                  &lt; Trở lại{" "}
                </Button>
              </Col>
            </Row>
          </>
        }
        style={{ marginBottom: 20 }}
      >
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Steps
              current={step - 1}
              status={status || "process"}
              items={order_steps}
            />
          </Col>
          <Col span={24}>
            <Divider />
          </Col>
          <Col span={8}>
            <Typography.Title level={4}>Địa chỉ nhận hàng</Typography.Title>
            <Typography.Title level={5}>
              {order.delivery?.recipientName}
            </Typography.Title>
            <Typography.Text type="secondary">
              {order.delivery?.phoneNumber}
              <br />
            </Typography.Text>
            <Typography.Text type="secondary">
              {formatAddress(order.delivery?.address)}
            </Typography.Text>
          </Col>
          <Col span={16}>
            <Steps progressDot direction="vertical" items={deliverySteps} />
          </Col>
        </Row>
      </Card>
      <Card
        title={
          <>
            <Row gutter={[12, 12]}>
              <Col span={3}>
                <ShopFilled /> <span>&nbsp;{order.store?.name}</span>
              </Col>
              <Col span={2}>
                <Button
                  style={{
                    height: 30,
                    width: "100%",
                    backgroundColor: "#ee4d2d",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                  onClick={handleNavigate}
                >
                  <MessageOutlined />
                  Chat
                </Button>
              </Col>
              <Col span={3}>
                <Button
                  style={{
                    height: 30,
                    width: "100%",
                  }}
                  onClick={() => navigate(`/store/${order.store?._id}`)}
                >
                  <ShopOutlined style={{ height: 30, fontWeight: 500 }} /> Xem
                  Shop
                </Button>
              </Col>
              <Col span={6}></Col>
              <Col span={4}></Col>

              <Col
                span={5}
                style={{
                  textAlign: "right",
                  textTransform: "uppercase",
                }}
              >
                <Typography.Title
                  level={5}
                  style={{
                    color:
                      STATUS_MAP[order.status as keyof typeof STATUS_MAP]
                        ?.color,
                  }}
                >
                  {STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.label ||
                    "Không xác định"}
                </Typography.Title>
              </Col>
              <Col span={1} style={{ textAlign: "right" }}>
                <Tooltip
                  title={`Cập nhật mới nhất:\n ${formatDate(order.updatedAt)}`}
                  style={{ color: "#ee4d2d" }}
                >
                  <QuestionCircleOutlined
                    style={{ cursor: "pointer", color: "#ee4d2d" }}
                  />
                </Tooltip>
              </Col>
            </Row>
          </>
        }
        style={{ marginBottom: 20 }}
      >
        <Table
          dataSource={order.orderDetails}
          columns={columns}
          rowKey="productId"
          pagination={false}
          showHeader={false}
        />
        <Row gutter={[12, 12]}>
          <Col span={16}></Col>
          <Col span={8}>
            <Descriptions
              title=""
              column={1}
              style={{ marginBottom: "15px", marginRight: 20 }}
              styles={{
                label: { width: "50%" },
                content: {
                  width: "50%",
                  textAlign: "right",
                  display: "inline",
                },
              }}
            >
              <Descriptions.Item label="Tổng tiền hàng">
                {calculateOrderDetails(
                  order?.orderDetails || []
                ).toLocaleString("vi-VN")}{" "}
                đ
              </Descriptions.Item>
              <Descriptions.Item label="Tiền ship">
                {order?.delivery?.shippingFee?.toLocaleString("vi-VN") || 0} đ
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền giảm giá">
                -{" "}
                {order?.coupon?.type === "fixed"
                  ? (order?.coupon?.value || 0).toLocaleString("vi-VN")
                  : (
                      (order?.coupon?.value || 0) *
                      calculateOrderDetails(order?.orderDetails || [])
                    ).toLocaleString("vi-VN")}{" "}
                đ
              </Descriptions.Item>
              <Descriptions.Item
                label="Tổng tiền"
                styles={{
                  label: { fontWeight: "bold" },
                  content: { fontWeight: "bold", color: "red" },
                }}
              >
                {order?.total?.toLocaleString("vi-VN") || 0} đ
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {order?.payment?.name || ""}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Typography.Text style={{ textAlign: "right", fontSize: 16 }}>
            Bạn cần thanh toán{" "}
            <span style={{ color: "red" }}>
              {order.delivery?.codAmount.toLocaleString("vi-VN")} đ
            </span>{" "}
            khi nhận hàng
          </Typography.Text>
        </Row>
      </Card>
    </div>
  ) : (
    <div>Order not found</div>
  );
};

export default OrderDetailsPage;
