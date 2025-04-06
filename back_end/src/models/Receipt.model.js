const mongoose = require("mongoose");

const receiptSchema = mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
    quantity: {
      type: Number,
      required: true,
    },
    provider: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = Receipt;
