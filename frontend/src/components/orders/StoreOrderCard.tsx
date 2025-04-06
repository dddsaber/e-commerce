import React from "react";
import { Order, OrderDetails } from "../../type/order.type";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Image,
  Row,
  Table,
  Tooltip,
  Typography,
} from "antd";
import {
  MessageOutlined,
  QuestionCircleOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { getSourceImage } from "../../utils/handle_image_func";
import { STATUS_MAP } from "../../utils/constant";
import { formatDate } from "../../utils/handle_format_func";

interface OrderCardProps {
  order: Order;
}

const StoreOrderCard: React.FC<OrderCardProps> = ({ order }) => {
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
                  {price.toLocaleString()} đ
                </span>
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {discountedPrice.toLocaleString()} đ
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 500 }}>
                {price.toLocaleString()} đ
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const calculateTotalPrice = (products: OrderDetails[]) => {
    return products.reduce((total, product) => {
      return (
        total + product.price * product.quantity * (1 - (product.discount ?? 0))
      );
    }, 0);
  };

  return (
    <Card
      title={
        <>
          <Row gutter={[12, 12]}>
            <Col span={3}>
              <span>{order.user?.name}</span>
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
      <Table
        dataSource={order.orderDetails}
        columns={columns}
        rowKey="productId"
        pagination={false}
        showHeader={false}
      />

      {/* Hiển thị tổng tiền */}
      <div
        style={{
          textAlign: "right",
          marginTop: "10px",
          fontWeight: "bold",
        }}
      >
        Tổng tiền:{" "}
        <span style={{ color: "red" }}>
          {calculateTotalPrice(order.orderDetails).toLocaleString()} đ
        </span>
      </div>
      <Row gutter={[16, 16]} style={{ marginTop: "40px" }}>
        <Col span={8}></Col>
        <Col span={16}>
          <Descriptions column={1}>
            <Descriptions.Item label="Ngày đặt hàng">
              {formatDate(order.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền sản phẩm">
              {order.total?.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Phí giao dịch">
              {(
                order.fees.commission +
                order.fees.transaction +
                order.fees.service
              ).toLocaleString()}{" "}
              đ
            </Descriptions.Item>
            <Descriptions.Item label="Phí thanh toán">
              {order.fees.transaction.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Phí cố định">
              {order.fees.commission.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Phí dịch vụ">
              {order.fees.service.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">
              {`${
                (order.delivery?.address.details,
                order.delivery?.address.ward,
                order.delivery?.address.district,
                order.delivery?.address.province)
              }`}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default StoreOrderCard;
