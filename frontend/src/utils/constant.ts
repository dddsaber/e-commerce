export const baseURL = "http://localhost:5000";

export const TYPE_USER = {
  admin: "admin",
  user: "user",
  sales: "sales",
  shipper: "shipper",
};

export const TYPE_USER_STR = {
  admin: "Quản lý",
  user: "Người dùng",
  shipper: "Người giao hàng",
  sales: "Người bán hàng",
};

export const colorOfType = {
  admin: "red",
  shipper: "green",
  sales: "orange",
  user: "purple",
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

export const COUPON_SCOPE = {
  all: "all",
  specific: "specific",
};
