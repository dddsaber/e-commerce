import { Coupon } from "../type/coupon.type";
import { Delivery, OrderDetails } from "../type/order.type";
import { STATUS_MAP } from "./constant";

export const checkStatus = (status?: string) => {
  if (!status) return false;
  const check_status =
    status === STATUS_MAP.pending.value ||
    status === STATUS_MAP.confirmed.value;
  return check_status;
};

export const checkCouponApplied = (record: Coupon, storeId: string) => {
  for (const store of record?.storeApplyCoupon || []) {
    if (store.storeId === storeId && !store.isDeleted) {
      return true;
    }
  }
  return false;
};

export const calculateOrderDetails = (orderDetails: OrderDetails[]) => {
  return orderDetails.reduce(
    (prev, cur) => prev + cur.price * cur.quantity * (1 - (cur.discount || 0)),
    0
  );
};

export const isFirstLog = (warehouseId: string, delivery: Delivery) => {
  return (
    delivery.deliveryLogs.length > 0 &&
    delivery.deliveryLogs[0].location.toString() === warehouseId
  );
};

export const checkDeliveryStatus = (
  warehouseId: string,
  delivery?: Delivery
) => {
  if (!delivery) return false;
  // Lấy index của log có `location` là warehouseId
  const index = delivery.deliveryLogs.findIndex(
    (deliveryLog) => deliveryLog.location.toString() === warehouseId
  );

  // Nếu không tìm thấy log, return false
  if (index === -1) return false;

  const currentLog = delivery.deliveryLogs[index];

  // Kiểm tra log này chưa có timestamp
  if (currentLog.timestamp) return false;

  // Nếu là log đầu tiên thì return true luôn (vì không có log nào trước đó để kiểm tra)
  if (index === 0) return true;

  // Kiểm tra tất cả logs trước đó phải có timestamp
  const allPreviousHaveTimestamp = delivery.deliveryLogs
    .slice(0, index) // Lấy các log trước đó
    .every((log) => log.timestamp); // Kiểm tra tất cả phải có timestamp

  return allPreviousHaveTimestamp;
};

export const isDeliveryCompleted = (
  warehouseId: string,
  delivery?: Delivery
) => {
  if (!delivery) return false;
  if (!delivery.deliveryLogs.length) return false;

  // Kiểm tra tất cả logs có timestamp hay chưa
  const allLogsHaveTimestamp = delivery.deliveryLogs.every(
    (log) => !!log.timestamp
  );

  // Kiểm tra log cuối cùng có location === warehouseId không
  const lastLog = delivery.deliveryLogs[delivery.deliveryLogs.length - 1];
  const lastLogIsWarehouse = lastLog.location.toString() === warehouseId;

  return allLogsHaveTimestamp && lastLogIsWarehouse;
};
