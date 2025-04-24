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
  Typography,
  Select,
  Row,
  Col,
  message,
} from "antd";
import { Order, OrderDetails } from "../../type/order.type";
import { getSourceImage } from "../../utils/handle_image_func";
import {
  NOTIFICATION_TARGET_MODEL,
  NOTIFICATION_TYPE,
  STATUS_MAP,
  TYPE_USER,
} from "../../utils/constant";
import { formatAddress, formatDate } from "../../utils/handle_format_func";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  calculateOrderDetails,
  checkStatus,
} from "../../utils/handle_status_func";
import { updateOrderStatus } from "../../api/order.api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { createNotification } from "../../api/notification.api";

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
  setSelectedOrder,
  onClose,
  selectedOrder = undefined,
  setReload,
  reload,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const handleUpdateStatus = async () => {
    const record = await updateOrderStatus(
      selectedOrder!._id!,
      selectedOrder!.status!
    );
    if (record) {
      message.success(
        `Cap nhat don hang ${selectedOrder!._id} sang trang thai ${
          selectedOrder!.status
        }`
      );
      const notification = await createNotification({
        userId: record.userId!,
        createdBy: user._id,
        title: NOTIFICATION_TYPE.ORDER_UPDATE.label,
        message: `Đơn hàng ${record._id} đã được cập nhật sang trạng thái ${
          STATUS_MAP[record.status as keyof typeof STATUS_MAP].label
        }`,
        target: record._id!,
        targetModel: NOTIFICATION_TARGET_MODEL.ORDER,
        image: selectedOrder?.orderDetails[0].product?.image,
      });
      if (!notification) {
        message.error("Tạo thông báo thất bại!");
      }
      setReload(!reload);
    }
  };

  const handleConfirm = async () => {
    const response = await updateOrderStatus(
      selectedOrder!._id!,
      STATUS_MAP.confirmed.value
    );
    if (response) {
      message.success(`Order ${selectedOrder?._id} has been confirmed!`);
      const notification = await createNotification({
        userId: response.userId!,
        createdBy: user._id,
        title: NOTIFICATION_TYPE.ORDER_UPDATE.label,
        message: `Đơn hàng ${response._id} đã được cập nhật sang trạng thái ${
          STATUS_MAP[response.status as keyof typeof STATUS_MAP].label
        }`,
        target: response._id!,
        targetModel: NOTIFICATION_TARGET_MODEL.ORDER,
        image: selectedOrder?.orderDetails[0].product?.image,
      });
      if (!notification) {
        message.error("Tạo thông báo thất bại!");
      }
      setReload(!reload);
    }
  };

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
      render: (price: number) => `${price.toLocaleString("vi-VN")} đ`,
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
        return (
          <span style={{ fontWeight: "bold" }}>{`${total.toLocaleString(
            "vi-VN"
          )} đ`}</span>
        );
      },
    },
  ];

  type OrderStatus = keyof typeof STATUS_MAP; // 🔹 Lấy kiểu dữ liệu của status

  const STATUS_FLOW: OrderStatus[] = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "completed",
  ];

  const currentStatus = selectedOrder?.status as OrderStatus | undefined;
  const currentIndex = currentStatus ? STATUS_FLOW.indexOf(currentStatus) : -1;
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
      <Row>
        <Col span={16}>
          <Descriptions title="" column={1} style={{ marginBottom: "15px" }}>
            <Descriptions.Item label="Mã đơn">
              {selectedOrder?._id}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {selectedOrder?.user?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số sản phẩm">
              {selectedOrder?.orderDetails?.length}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {
                STATUS_MAP[selectedOrder?.status as keyof typeof STATUS_MAP]
                  ?.label
              }
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedOrder?.payment?.name || "Không xác định"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {selectedOrder?.delivery?.address
                ? `${selectedOrder.delivery.address.details}, ${selectedOrder.delivery.address.ward}, ${selectedOrder.delivery.address.district}, ${selectedOrder.delivery.address.province}`
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
        </Col>
        <Col span={8}>
          <Descriptions
            title=""
            column={1}
            style={{ marginBottom: "15px" }}
            styles={{ label: { width: "50%" }, content: { width: "50%" } }}
          >
            <Descriptions.Item label="Tổng tiền sản phẩm">
              {calculateOrderDetails(
                selectedOrder?.orderDetails || []
              ).toLocaleString("vi-VN")}{" "}
              đ
            </Descriptions.Item>
            <Descriptions.Item label="Tiền ship">
              {selectedOrder?.delivery?.shippingFee?.toLocaleString("vi-VN") ||
                0}{" "}
              đ
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền giảm giá">
              -{" "}
              {selectedOrder?.coupon?.type === "fixed"
                ? (selectedOrder?.coupon?.value || 0).toLocaleString("vi-VN")
                : (
                    (selectedOrder?.coupon?.value || 0) *
                    calculateOrderDetails(selectedOrder?.orderDetails || [])
                  ).toLocaleString("vi-VN")}{" "}
              đ
            </Descriptions.Item>
            <Descriptions.Item
              label="Tổng tiền"
              styles={{
                label: { fontWeight: "bold" },
                content: { fontWeight: "bold" },
              }}
            >
              {selectedOrder?.total?.toLocaleString("vi-VN") || 0} đ
            </Descriptions.Item>
            <Descriptions.Item label="Phí thanh toán">
              - {selectedOrder?.fees.transaction?.toLocaleString("vi-VN") || 0}{" "}
              đ
            </Descriptions.Item>
            <Descriptions.Item label="Phí cố định">
              - {selectedOrder?.fees.commission?.toLocaleString("vi-VN") || 0} đ
            </Descriptions.Item>
            <Descriptions.Item label="Phí dịch vụ">
              - {selectedOrder?.fees.service?.toLocaleString("vi-VN") || 0} đ
            </Descriptions.Item>
            <Descriptions.Item
              label="Phí giao dịch"
              styles={{
                label: { fontWeight: "bold" },
                content: { fontWeight: "bold" },
              }}
            >
              -{" "}
              {(
                (selectedOrder?.fees.commission || 0) +
                (selectedOrder?.fees.transaction || 0) +
                (selectedOrder?.fees.service || 0)
              ).toLocaleString("vi-VN")}{" "}
              đ
            </Descriptions.Item>

            <Descriptions.Item
              label="Doanh thu"
              styles={{
                label: { fontWeight: "bold" },
                content: { fontWeight: "bold" },
              }}
            >
              {(
                (selectedOrder?.total || 0) -
                ((selectedOrder?.fees.commission || 0) +
                  (selectedOrder?.fees.transaction || 0) +
                  (selectedOrder?.fees.service || 0))
              ).toLocaleString("vi-VN")}{" "}
              đ
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>

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
      <Descriptions
        title="Theo dõi vận chuyển"
        style={{ marginTop: 10 }}
        column={1}
        styles={{
          label: { width: "50%" },
          content: { width: "50%" },
        }}
      >
        {selectedOrder?.delivery?.deliveryLogs?.map((log) => (
          <Descriptions.Item
            key={log._id}
            label={formatAddress(log.warehouseInfo.address)}
          >
            <span style={{ color: log.timestamp ? "green" : "orange" }}>
              {log.timestamp ? formatDate(log.timestamp) : "Chưa giao tới"}
            </span>
          </Descriptions.Item>
        ))}
        <Descriptions.Item
          label={formatAddress(selectedOrder?.delivery?.address)}
        >
          <span
            style={{
              color: selectedOrder?.delivery?.deliveredDate
                ? "green"
                : "orange",
            }}
          >
            {selectedOrder?.delivery?.deliveredDate
              ? formatDate(selectedOrder?.delivery?.deliveredDate)
              : "Chưa giao tới"}
          </span>
        </Descriptions.Item>
      </Descriptions>
      {user.role === TYPE_USER.admin ? (
        <Flex justify="space-around" style={{ margin: "20px 0 0" }}>
          <Typography.Text>
            <strong>Cập nhật trạng thái:</strong>
          </Typography.Text>
          <Select
            style={{ width: 200 }}
            value={currentStatus}
            onChange={(value: OrderStatus) => {
              setSelectedOrder({
                ...selectedOrder,
                status: value,
              } as Order); // 🔹 Ép kiểu để tránh lỗi TypeScript
            }}
            placeholder="Chọn trạng thái"
            disabled={
              currentStatus === "cancelled" || currentStatus === "completed"
            }
          >
            {STATUS_FLOW.map((status) => (
              <Select.Option
                key={status}
                value={status}
                disabled={STATUS_FLOW.indexOf(status) < currentIndex}
              >
                <Typography.Text style={{ color: STATUS_MAP[status].color }}>
                  {STATUS_MAP[status].label}
                </Typography.Text>
              </Select.Option>
            ))}
          </Select>
          <Button
            style={{
              color: "blue",
              border: "1px solid blue",
            }}
            onClick={() => handleUpdateStatus()}
          >
            <SaveOutlined />
            Cập nhật trạng thái
          </Button>
          <Button
            type="text"
            onClick={() => {
              setSelectedOrder({
                ...selectedOrder,
                status: STATUS_MAP.cancelled.value,
              } as Order);
            }}
            disabled={!(selectedOrder?.status === STATUS_MAP.pending.value)}
            style={{
              color: "red",
              border: "1px solid red",
            }}
          >
            {checkStatus(selectedOrder?.status) ? (
              <>
                <CloseCircleOutlined />
                Hủy đơn
              </>
            ) : (
              <>
                <CloseCircleFilled />
                Đã hủy
              </>
            )}
          </Button>
        </Flex>
      ) : (
        <div style={{ margin: "15px", textAlign: "center" }}>
          <Button
            type="text"
            onClick={() => handleConfirm()}
            disabled={!(selectedOrder?.status === STATUS_MAP.pending.value)}
            style={{
              color: "green",
              border: "1px solid green",
              marginRight: 20,
            }}
          >
            {selectedOrder?.status === STATUS_MAP.pending.value ||
            selectedOrder?.status === STATUS_MAP.cancelled.value ? (
              <>
                <CheckCircleOutlined /> Xác nhận đơn
              </>
            ) : (
              <>
                <CheckCircleFilled /> Đã xác nhận
              </>
            )}
          </Button>
          <Button
            type="text"
            onClick={() => {
              setSelectedOrder({
                ...selectedOrder,
                status: STATUS_MAP.cancelled.value,
              } as Order);
            }}
            disabled={!(selectedOrder?.status === STATUS_MAP.pending.value)}
            style={{
              color: "red",
              border: "1px solid red",
            }}
          >
            {checkStatus(selectedOrder?.status) ? (
              <>
                <CloseCircleOutlined />
                Hủy đơn
              </>
            ) : (
              <>
                <CloseCircleFilled />
                Đã hủy
              </>
            )}
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default OrderDrawer;
