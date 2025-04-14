const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    orderDetails: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },
    statusTimestamps: {
      pending: {
        type: Date,
      },
      confirmed: {
        type: Date,
      },
      shipped: {
        type: Date,
      },
      delivered: {
        type: Date,
      },
      cancelled: {
        type: Date,
      },
      completed: {
        type: Date,
      },
    },
    customerNote: {
      type: String,
    },
    staffNote: {
      type: String,
    },
    cancelNote: {
      type: String,
    },
    description: {
      type: String,
    },
    fees: {
      commission: {
        type: Number,
        default: 0,
      },
      transaction: {
        type: Number,
        default: 0,
      },
      service: {
        type: Number,
        default: 0,
      },
    },
    weight: {
      type: Number,
    },
    settled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("validate", async function (next) {
  // Lấy trạng thái cũ từ database trước khi thay đổi
  if (this.isModified("status")) {
    const existingOrder = await this.constructor
      .findById(this._id)
      .select("status");
    if (existingOrder) {
      this.$locals.previousStatus = existingOrder.status;
    }
  }
  next();
});

orderSchema.pre("save", function (next) {
  console.log("Middleware 2: Cập nhật timestamp trạng thái");

  if (!this.statusTimestamps[this.status]) {
    this.statusTimestamps[this.status] = new Date();
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
