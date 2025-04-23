const { Router } = require("express");
const {
  createPayment,
  updatePayment,
  getPaymentById,
  updatePaymentStatus,
  getPayments,
} = require("../controllers/payment/payment.controller");

const router = Router();

router.post("/create-payment", createPayment);

router.put("/:paymentId/update-payment", updatePayment);

router.get("/:paymentId/get-by-id", getPaymentById);

router.put("/:paymentId/update-payment-status", updatePaymentStatus);

router.post("/get-payments", getPayments);

module.exports = router;
