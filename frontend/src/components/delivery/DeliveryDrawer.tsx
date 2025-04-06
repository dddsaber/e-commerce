import React from "react";
import { Button, Descriptions, Drawer, Flex, Tag, Typography } from "antd";
import { Delivery } from "../../type/order.type";
import { DELIVERY_STATUS_MAP, STATUS_MAP } from "../../utils/constant";
import { formatAddress, formatDate } from "../../utils/handle_format_func";
import {
  checkDeliveryStatus,
  isDeliveryCompleted,
  isFirstLog,
} from "../../utils/handle_status_func";
import { updateOrderStatus } from "../../api/order.api";
import { updateTimeStamp } from "../../api/delivery.api";

interface DeliveryDrawerProps {
  visible: boolean;
  reload: boolean;
  setReload: (value: boolean) => void;
  setLoading?: (value: boolean) => void;
  setSelectedDelivery: (value: Delivery | undefined) => void;
  onClose: () => void;
  selectedDelivery?: Delivery;
  warehouseId?: string;
}

const DeliveryDrawer: React.FC<DeliveryDrawerProps> = ({
  visible,
  onClose,
  selectedDelivery = undefined,
  setReload,
  reload,
  warehouseId,
}) => {
  const canConfirm = checkDeliveryStatus(warehouseId!, selectedDelivery!);
  const canDeliver = isDeliveryCompleted(warehouseId!, selectedDelivery!);
  const handleConfirm = async (record: Delivery) => {
    if (!canConfirm) {
      return;
    }
    if (isFirstLog(warehouseId!, record)) {
      await updateOrderStatus(record.orderId, STATUS_MAP.shipped.value);
      await updateTimeStamp(record._id, warehouseId!);
    } else {
      await updateTimeStamp(record._id, warehouseId!);
    }
    onClose();
    setReload(!reload);
  };

  const handleDelivery = async (record: Delivery) => {
    if (!canDeliver) {
      return;
    }
    await updateOrderStatus(record.orderId, STATUS_MAP.delivered.value);
    onClose();
    setReload(!reload);
  };

  const status = selectedDelivery?.status as keyof typeof DELIVERY_STATUS_MAP;

  return (
    <Drawer
      title={
        selectedDelivery?._id ? (
          <Flex justify="space-between">
            <div>
              {selectedDelivery._id} <span>&nbsp;</span>
            </div>
          </Flex>
        ) : (
          ""
        )
      }
      width={700}
      open={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button
            onClick={() => handleDelivery(selectedDelivery!)}
            style={{ marginRight: 8 }}
            disabled={!canDeliver}
          >
            Hoàn thành đơn
          </Button>
          <Button
            onClick={() => handleConfirm(selectedDelivery!)}
            style={{ marginRight: 8 }}
            disabled={!canConfirm}
          >
            Nhận đơn
          </Button>

          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
        </div>
      }
    >
      <Descriptions
        column={1}
        styles={{
          label: { width: "50%" },
          content: { width: "50%" },
        }}
      >
        <Descriptions.Item label="Mã đơn vận chuyển">
          {selectedDelivery?._id}
        </Descriptions.Item>
        <Descriptions.Item label="Mã đơn hàng">
          {selectedDelivery?.orderId}
        </Descriptions.Item>
        <Descriptions.Item label="Tình trạng đơn hàng">
          {status ? (
            <Tag color={DELIVERY_STATUS_MAP[status]?.color}>
              {DELIVERY_STATUS_MAP[status]?.label}
            </Tag>
          ) : (
            "Bị lỗi!"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Tên người nhận">
          {selectedDelivery?.recipientName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại người nhận">
          {selectedDelivery?.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {`${selectedDelivery?.address?.ward}, ${selectedDelivery?.address?.district}, ${selectedDelivery?.address?.province}, ${selectedDelivery?.address?.details}`}
        </Descriptions.Item>
        <Descriptions.Item label="Mã bưu điện">
          {selectedDelivery?.postalCode || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Phí vận chuyển">
          {selectedDelivery?.shippingFee.toLocaleString("vi-VN")} VND
        </Descriptions.Item>
        <Descriptions.Item label="Số tiền COD">
          {selectedDelivery?.codAmount.toLocaleString("vi-VN")} VND
        </Descriptions.Item>
        <Descriptions.Item label="Tình trạng thanh toán">
          {selectedDelivery?.paymentStatus === "unpaid"
            ? "Chưa trả tiền"
            : "Đã trả tiền"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày ước tính giao hàng">
          {selectedDelivery?.estimatedDate
            ? formatDate(selectedDelivery?.estimatedDate)
            : "Chưa có"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày giao hàng thực tế">
          {selectedDelivery?.deliveredDate
            ? formatDate(selectedDelivery?.deliveredDate)
            : "Chưa giao"}
        </Descriptions.Item>
        <Descriptions.Item label="Lý do không giao thành công">
          {selectedDelivery?.failedReason || "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Thông tin đơn vị vận chuyển">
          {selectedDelivery?.courier || "Chưa có thông tin"}
        </Descriptions.Item>
        <Descriptions.Item label="Số theo dõi">
          {selectedDelivery?.trackingNumber || "Chưa có số theo dõi"}
        </Descriptions.Item>
      </Descriptions>
      <Typography.Title level={5}>Lịch sử giao hàng</Typography.Title>
      <Descriptions
        column={1}
        styles={{
          label: { width: "50%" },
          content: { width: "50%" },
        }}
      >
        {selectedDelivery?.deliveryLogs?.map((log) => (
          <Descriptions.Item
            key={log._id}
            label={formatAddress(log.warehouseInfo.address)}
          >
            <span style={{ color: log.timestamp ? "green" : "orange" }}>
              {log.timestamp ? formatDate(log.timestamp) : "Chưa giao tới"}
            </span>
          </Descriptions.Item>
        ))}
        <Descriptions.Item label={formatAddress(selectedDelivery?.address)}>
          <span
            style={{
              color: selectedDelivery?.deliveredDate ? "green" : "orange",
            }}
          >
            {selectedDelivery?.deliveredDate
              ? formatDate(selectedDelivery?.deliveredDate)
              : "Chưa giao tới"}
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default DeliveryDrawer;
