import React, { useState } from "react";
import { Order, OrderDetails } from "../../type/order.type";
import {
  Button,
  Card,
  Col,
  Image,
  message,
  Modal,
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
import ReviewModalMulti from "../reviews/ReviewModelMulti";
import { cancelOrder, updateOrderStatus } from "../../api/order.api";
import TextArea from "antd/es/input/TextArea";

interface OrderCardProps {
  order: Order;
  userId: string;
  reload: boolean;
  setReload: (value: boolean) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  userId,
  reload,
  setReload,
}) => {
  const navigate = useNavigate();
  const [reviewVisible, setReviewVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
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
      message.error(`Không tìm thấy đơn hàng!`);
      return;
    }
    console.log(order.store);
    navigate("/chat", {
      state: { userId: order.store?.userId }, // Truyền userId qua state
    });
  };

  const handleCancel = async () => {
    if (!order._id) {
      message.error(`Không tìm thấy đơn hàng!`);
      return;
    }
    try {
      await cancelOrder(order._id, note);
      setModalVisible(false);
      message.success("Thành công hủy đơn");
      setReload(!reload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    }
  };

  const handleComplete = async () => {
    if (!order._id) {
      message.error(`Không tìm thấy đơn hàng!`);
      return;
    }
    try {
      await updateOrderStatus(order._id, STATUS_MAP.completed.value);
      setModalVisible(false);
      message.success("Thành công xác nhận đơn");
      setReload(!reload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error);
    }
  };

  return (
    <Card
      title={
        <>
          <Row
            gutter={[12, 12]}
            align="middle"
            justify="space-between"
            wrap
            style={{ marginTop: 5 }}
          >
            <Col xs={24} sm={12} md={6}>
              <ShopFilled /> <span>&nbsp;{order.store?.name}</span>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Button
                block
                size="middle"
                style={{
                  backgroundColor: "#ee4d2d",
                  color: "#fff",
                  fontWeight: 500,
                }}
                onClick={handleNavigate}
              >
                <MessageOutlined /> Chat
              </Button>
            </Col>

            <Col xs={12} sm={6} md={3}>
              <Button
                block
                size="middle"
                onClick={() => navigate(`/store/${order.store?._id}`)}
              >
                <ShopOutlined /> Xem Shop
              </Button>
            </Col>

            <Col xs={24} sm={12} md={8} style={{ textAlign: "right" }}>
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                  color:
                    STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.color,
                  textTransform: "uppercase",
                }}
              >
                {STATUS_MAP[order.status as keyof typeof STATUS_MAP]?.label ||
                  "Không xác định"}
              </Typography.Title>
            </Col>

            <Col xs={0} sm={0} md={1} style={{ textAlign: "right" }}>
              <Tooltip
                title={`Cập nhật mới nhất:\n ${formatDate(order.updatedAt)}`}
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
      <Row gutter={[16, 16]} style={{ marginTop: "40px" }} justify="end" wrap>
        {/* Xác nhận (khi đã giao hàng) */}
        {order.status === STATUS_MAP.delivered.value && (
          <Col xs={24} sm={12} md={4}>
            <Button
              block
              style={{
                height: 40,
                backgroundColor: "#52c41a",
                color: "#fff",
                fontWeight: 500,
              }}
              onClick={() => handleComplete()}
            >
              Đã nhận
            </Button>
          </Col>
        )}

        {/* Đánh giá (khi đã hoàn tất) */}
        {order.status === STATUS_MAP.completed.value && (
          <Col xs={24} sm={12} md={4}>
            <Button
              block
              style={{
                height: 40,
                backgroundColor: "#1890ff",
                color: "#fff",
                fontWeight: 500,
              }}
              onClick={() => setReviewVisible(true)}
            >
              Đánh giá
            </Button>
          </Col>
        )}

        {/* Liên hệ người bán (luôn có) */}
        <Col xs={24} sm={12} md={4}>
          <Button
            block
            style={{ height: 40, fontWeight: 500 }}
            onClick={handleNavigate}
          >
            Liên hệ người bán
          </Button>
        </Col>

        {/* Hủy đơn (chỉ khi chưa xử lý) */}
        {order.status === STATUS_MAP.pending.value && (
          <Col xs={24} sm={12} md={4}>
            <Button
              block
              style={{
                height: 40,
                backgroundColor: "#ff4d4f",
                color: "#fff",
                fontWeight: 500,
              }}
              onClick={() => setModalVisible(true)}
            >
              Hủy đơn
            </Button>
          </Col>
        )}
      </Row>

      <Modal
        title="Lý do hủy đơn"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={500}
        onOk={() => handleCancel()}
      >
        <TextArea value={note} onChange={(e) => setNote(e.target.value)} />
      </Modal>
      <ReviewModalMulti
        isVisible={reviewVisible}
        products={order.orderDetails}
        userId={userId}
        setIsVisible={setReviewVisible}
      />
    </Card>
  );
};

export default OrderCard;
