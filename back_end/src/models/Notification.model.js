const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: "targetModel", // 👈 dynamic reference
    },
    targetModel: {
      type: String,
      enum: ["Order", "Coupon", "User", "Product", "Report", "Store"], // 👈 tên các collection bạn muốn reference
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    linkTo: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
