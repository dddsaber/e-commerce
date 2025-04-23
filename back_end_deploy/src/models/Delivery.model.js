const mongoose = require("mongoose");
const { DELIVERY_STATUS, ORDER_STATUS } = require("../utils/constants.utils");

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    courier: { type: String }, // Đơn vị vận chuyển (GHTK, GHN...)
    trackingNumber: { type: String, unique: true, sparse: true }, // Mã theo dõi đơn hàng

    estimatedDate: { type: Date }, // Ngày dự kiến giao hàng
    deliveredDate: { type: Date }, // Ngày hàng đến tay khách

    failedReason: { type: String }, // Lý do giao thất bại

    // Địa chỉ giao hàng
    recipientName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: {
      province: { type: String },
      district: { type: String },
      ward: { type: String },
      details: { type: String },
    },
    postalCode: { type: String },

    // Thông tin thanh toán
    shippingFee: { type: Number, required: true },
    codAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    // Lịch sử trạng thái giao hàng
    deliveryLogs: [
      {
        timestamp: { type: Date },
        location: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Warehouse",
        },
      },
    ],

    // Trạng thái
    status: {
      type: String,
      enum: ["awaiting_pickup", "in_transit", "delivered", "failed"],
      default: "awaiting_pickup",
    },
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", deliverySchema);
module.exports = Delivery;
