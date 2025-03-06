import React from "react";
import {
  Drawer,
  Button,
  Descriptions,
  Avatar,
  Flex,
  Image,
  TableColumnsType,
  Table,
} from "antd";
import { Order, OrderDetails } from "../../type/order.type";
import { getSourceImage } from "../../utils/handle_image_func";
import { STATUS_MAP } from "../../utils/constant";
import { formatDate } from "../../utils/handle_format_func";

interface OrderDrawerProps {
  visible: boolean;
  reload: boolean;
  setReload: (value: boolean) => void;
  setSelectedOrder: (value: Order | undefined) => void;
  onClose: () => void;
  selectedOrder?: Order;
}

const OrderDrawer: React.FC<OrderDrawerProps> = ({
  visible,
  reload,
  setReload,
  setSelectedOrder,
  onClose,
  selectedOrder = undefined,
}) => {
  const itemColumns: TableColumnsType<OrderDetails> = [
    {
      title: "Ảnh",
      dataIndex: ["product", "image"],
      key: "product.image",
      width: 60,
      align: "center" as const,
      render: (image: string) => (
        <Image
          style={{ width: 75, height: 75 }}
          src={getSourceImage(image) || "default.jpg"}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: ["product", "name"],
      key: "product.name",
      width: 300,
      align: "left" as const,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 100,
      align: "center" as const,
      render: (price: number) => `${price} đ`,
    },
    {
      title: "Giảm",
      dataIndex: "discount",
      key: "discount",
      width: 100,
      align: "center" as const,
      render: (discount: number) => `${discount * 100} %`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center" as const,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      render: (text, record) => {
        let total;
        if (!record.price || !record.quantity) {
          total = 0;
        } else {
          total = record.price * record.quantity * (1 - (record.discount ?? 0));
        }
        return `${total.toFixed(2)} đ`;
      },
    },
  ];

  return (
    <Drawer
      title={
        selectedOrder?._id ? (
          <Flex justify="space-between">
            <div>
              {selectedOrder._id} <span>&nbsp;</span>
            </div>
            <div>
              <Avatar src={getSourceImage(selectedOrder.store?.logo || "")} />{" "}
              <span>&nbsp;{selectedOrder.store?.name}</span>
            </div>
          </Flex>
        ) : (
          ""
        )
      }
      width={900}
      open={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
        </div>
      }
    >
      <Descriptions title="" column={2} style={{ marginBottom: "15px" }}>
        <Descriptions.Item label="Mã đơn">
          {selectedOrder?._id}
        </Descriptions.Item>
        <Descriptions.Item label="Số sản phẩm">
          {selectedOrder?.orderDetails?.length}
        </Descriptions.Item>
        <Descriptions.Item label="Khách hàng">
          {selectedOrder?.user?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Người xử lý đơn">
          {selectedOrder?.staff?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Khoảng cách">
          {selectedOrder?.distance}
        </Descriptions.Item>
        <Descriptions.Item label="Tiền ship">
          {selectedOrder?.shippingFee}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">
          {selectedOrder?.total?.toFixed(2) || 0} đ
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {STATUS_MAP[selectedOrder?.status as keyof typeof STATUS_MAP]?.label}
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {selectedOrder?.payment?.name || "Không xác định"}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {selectedOrder?.address
            ? `${selectedOrder.address.details}, ${selectedOrder.address.ward}, ${selectedOrder.address.district}, ${selectedOrder.address.province}`
            : "Chưa có thông tin địa chỉ"}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú khách hàng">
          {selectedOrder?.customerNote}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú cửa hàng">
          {selectedOrder?.staffNote}
        </Descriptions.Item>
        <Descriptions.Item label="Mã giảm giá">
          {selectedOrder?.coupon?.type === "fixed"
            ? selectedOrder?.coupon?.value || 0 + "đ"
            : selectedOrder?.coupon?.value || 0 + "%"}
        </Descriptions.Item>
      </Descriptions>
      <label>
        <strong>Chi tiết đơn hàng</strong>
      </label>
      <Table
        rowKey={(record) => record._id || "index"}
        columns={itemColumns}
        dataSource={selectedOrder?.orderDetails}
        size="small"
        pagination={false}
        style={{ width: "100%" }}
        showHeader={false}
        scroll={{ x: "max-content" }} // Đảm bảo bảng con có thể cuộn ngang
      />
      <Descriptions
        column={2}
        title="Theo dõi trạng thái"
        style={{ marginTop: "10px" }}
      >
        <Descriptions.Item label={STATUS_MAP["pending"].label}>
          {selectedOrder?.statusTimestamps?.pending
            ? formatDate(selectedOrder.statusTimestamps.pending)
            : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label={STATUS_MAP["confirmed"].label}>
          {selectedOrder?.statusTimestamps?.confirmed
            ? formatDate(selectedOrder.statusTimestamps.confirmed)
            : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label={STATUS_MAP["shipped"].label}>
          {selectedOrder?.statusTimestamps?.shipped
            ? formatDate(selectedOrder.statusTimestamps.shipped)
            : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label={STATUS_MAP["delivered"].label}>
          {selectedOrder?.statusTimestamps?.delivered
            ? formatDate(selectedOrder.statusTimestamps.delivered)
            : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label={STATUS_MAP["completed"].label}>
          {selectedOrder?.statusTimestamps?.completed
            ? formatDate(selectedOrder.statusTimestamps.completed)
            : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label={STATUS_MAP["cancelled"].label}>
          {selectedOrder?.statusTimestamps?.cancelled
            ? formatDate(selectedOrder.statusTimestamps.cancelled)
            : "Chưa cập nhật"}
        </Descriptions.Item>
      </Descriptions>
      {/* <Flex justify="space-around" style={{ margin: "20px 0 0" }}>
          <Text>
            <strong>Cập nhật trạng thái:</strong>
          </Text>
          <Select
            style={{ width: 200 }}
            value={selectedOrder?.status}
            onChange={(value) => {
              setSelectedOrder((prevOrder) => ({
                ...prevOrder,
                status: value,
              }));
            }}
            placeholder="Chọn trạng thái"
            disabled={
              selectedOrder?.status === "cancelled" ||
              selectedOrder?.status === "complete"
            }
          >
            {Object.entries(STATUS_MAP).map(([key, { label, color }]) => (
              <Select.Option key={key} value={key}>
                <Text style={{ color: color }}>{label}</Text>
              </Select.Option>
            ))}
          </Select>
        </Flex> */}
    </Drawer>
  );
};

export default OrderDrawer;
