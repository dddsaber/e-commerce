const mongoose = require("mongoose");

const PayoutSchema = mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    orders: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Order",
    },
    totalPayout: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Payout = mongoose.model("Payout", PayoutSchema);

module.exports = Payout;
