const { Router } = require("express");
const {
  createOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrders,
} = require("../controllers/order/order.controller");

const router = Router();

router.post("/create-order", createOrder);

router.get("/:orderId/order", getOrderById);

router.put("/:orderId/update-order-status", updateOrderStatus);

router.put("/:orderId/cancel-order", cancelOrder);

router.post("/get-orders", getOrders);

module.exports = router;
