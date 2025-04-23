const ModelCart = require("../../model/ModelCart");
const ModelPaymentSuccess = require("../../model/ModelPaymentSuccess");
const { jwtDecode } = require("jwt-decode");

const { VNPay, ignoreLogger, ProductCode, VnpLocale } = require("vnpay");

const PaymentsMomo = async (order) => {
  const vnpay = new VNPay({
    tmnCode: "H8IRFV90",
    secureSecret: "U9TUI8T81IXN78G2KQ5LRR721FHUIJL5",
    vnpayHost: "https://sandbox.vnpayment.vn",
    testMode: true, // tùy chọn
    hashAlgorithm: "SHA512", // tùy chọn
    enableLog: true, // tùy chọn
    loggerFn: ignoreLogger, // tùy chọn
  });
  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: order.total,
    vnp_IpAddr: "13.160.92.202",
    vnp_TxnRef: order._id,
    vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: "http://localhost:5000/vnpay-return",
    vnp_Locale: VnpLocale.VN,
  });
  return res.status(200).json(paymentUrl);
};
