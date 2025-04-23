const reportCategories = {
  REVIEW: "REVIEW",
  PRODUCT: "PRODUCT",
  USER: "USER",
  STORE: "STORE",
  ORDER: "ORDER",
};

const TYPE_USER = {
  admin: "admin",
  user: "user",
  sales: "sales",
  shipper: "shipper",
  logistic_provider: "logistic_provider",
};

const TYPE_IMAGE = {
  product: "product",
  user: "user",
  store: "store",
  review: "review",
};

const ORDER_STATUS = {
  pending: "pending",
  confirmed: "confirmed",
  shipped: "shipped",
  delivered: "delivered",
  completed: "completed",
  cancelled: "cancelled",
};

// Constant trạng thái giao hàng
const DELIVERY_STATUS = {
  AWAITING_PICKUP: "awaiting_pickup",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  FAILED: "failed",
};

const BOOK_SHOP_EMAIL = "nhbl.loc@gmail.com";
const BOOK_SHOP_PASSWORD = "weiz mncc yalx rist";

// URL den form o frontend
const confirmationUrl = `http://localhost:5173/change-password`;

module.exports = {
  reportCategories,
  TYPE_USER,
  TYPE_IMAGE,
  ORDER_STATUS,
  DELIVERY_STATUS,
  confirmationUrl,
  BOOK_SHOP_EMAIL,
  BOOK_SHOP_PASSWORD,
};
