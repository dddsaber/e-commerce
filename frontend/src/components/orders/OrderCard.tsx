import React from "react";
import { Order, OrderDetails } from "../../type/order.type";
import {
  Button,
  Card,
  Col,
  Image,
  message,
  Row,
  Table,
  Tooltip,
  Typography,
} from "antd";
import {
  MessageOutlined,
  QuestionCircleOutlined,
  ShopFilled,
  ShopOutlined,
} from "@ant-design/icons";
import { getSourceImage } from "../../utils/handle_image_func";
import { STATUS_MAP } from "../../utils/constant";
import { formatDate } from "../../utils/handle_format_func";
import { useNavigate } from "react-router-dom";

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const columns = [
    {
      title: "Image",
      width: 100,
      render: (_: unknown, record: OrderDetails) => (
        <Image
          width={80}
          src={getSourceImage(record.product?.image || "")}
          alt={record.product?.name || ""}
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
                    color: "gray",
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
              <span style={{ fontWeight: 500 }}>
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
  return (
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
                    STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.color,
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
      <div
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/account/order/${order._id}`)}
      >
        <Table
          dataSource={order.orderDetails}
          columns={columns}
          rowKey="productId"
          pagination={false}
          showHeader={false}
        />
      </div>

      {/* Hiển thị tổng tiền */}
      <div
        style={{
          textAlign: "right",
          marginTop: "10px",
          fontWeight: "bold",
        }}
      >
        Thành tiền:{" "}
        <span style={{ color: "red" }}>
          {(order.total || 0).toLocaleString("vi-VN")} đ
        </span>
      </div>
      <Row gutter={[16, 16]} style={{ marginTop: "40px" }}>
        <Col span={12}></Col>
        <Col span={4}>
          <Button
            style={{
              height: 40,
              width: "100%",
              backgroundColor: "#ee4d2d",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            Đánh giá
          </Button>
        </Col>
        <Col span={4}>
          <Button style={{ height: 40, width: "100%", fontWeight: 500 }}>
            Mua lại
          </Button>
        </Col>
        <Col span={4}>
          <Button
            style={{ height: 40, width: "100%", fontWeight: 500 }}
            onClick={handleNavigate}
          >
            Liên hệ người bán
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default OrderCard;
