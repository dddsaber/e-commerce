const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    logistic_provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến user có role "logistic_provider"
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      province: {
        type: String,
      },
      district: {
        type: String,
      },
      ward: {
        type: String,
      },
      details: {
        type: String,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // Chỉ cho phép "Point"
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // Mảng [longitude, latitude]
        required: true,
      },
    },
    capacity: {
      type: Number, // Số lượng tối đa đơn hàng/kho
      default: 1000,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo chỉ mục không gian địa lý
warehouseSchema.index({ location: "2dsphere" });

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
