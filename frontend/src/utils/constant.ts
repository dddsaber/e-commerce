export const baseURL = "http://localhost:5000";

export const TYPE_USER = {
  admin: "admin",
  user: "user",
  sales: "sales",
  shipper: "shipper",
  logistic_provider: "logistic_provider",
};

export const TYPE_USER_STR = {
  admin: "Quản lý",
  user: "Người dùng",
  shipper: "Người giao hàng",
  sales: "Người bán hàng",
  logistic_provider: "Đơn vị vận chuyển",
};

export const colorOfType = {
  admin: "red",
  shipper: "green",
  sales: "orange",
  user: "purple",
  logistic_provider: "blue",
};

export const TYPE_IMAGE = {
  product: "product",
  user: "user",
  store: "store",
  review: "review",
};

export const STATUS_MAP = {
  pending: { label: "Chờ duyệt", color: "blue", value: "pending" },
  confirmed: { label: "Xác nhận", color: "yellow", value: "confirmed" },
  shipped: { label: "Đang giao", color: "orange", value: "shipped" },
  delivered: { label: "Đã giao hàng", color: "green", value: "delivered" },
  completed: { label: "Đã nhận", color: "darkgreen", value: "completed" },
  cancelled: { label: "Đã hủy", color: "red", value: "cancelled" },
};

export const DELIVERY_STATUS_MAP = {
  awaiting_pickup: {
    label: "Chờ lấy hàng",
    color: "blue",
    value: "awaiting_pickup",
  },
  in_transit: {
    label: "Đang vận chuyển",
    color: "orange",
    value: "in_transit",
  },
  delivered: { label: "Đã giao", color: "green", value: "delivered" },
  failed: { label: "Giao thất bại", color: "red", value: "failed" },
};

// Constant trạng thái giao hàng
export const DELIVERY_STATUS = {
  AWAITING_PICKUP: "awaiting_pickup",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  FAILED: "failed",
};

export const STATUS_FLOW = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

export const COUPON_SCOPE = {
  all: "all",
  specific: "specific",
};

export const NOTIFICATION_TYPE = {
  ORDER_UPDATE: {
    label: "Đơn hàng đã được cập nhật",
    color: "orange",
  },
  USER_UPDATE: {
    label: "Thông tin người dùng đã thay đổi",
    color: "purple",
  },
  REPORT_UPDATE: {
    label: "Báo cáo đã được cập nhật",
    color: "red",
  },
  PRODUCT_UPDATE: {
    label: "Sản phẩm đã được cập nhật",
    color: "green",
  },
  STORE_UPDATE: {
    label: "Cửa hàng đã được cập nhật",
    color: "blue",
  },
  COUPON_UPDATE: {
    label: "Phiếu giảm giá mới",
    color: "yellow",
  },
};

export const NOTIFICATION_TARGET_MODEL = {
  ORDER: "Order",
  USER: "User",
  REPORT: "Report",
  PRODUCT: "Product",
  STORE: "Store",
  COUPON: "Coupon",
};
