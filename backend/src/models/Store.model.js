const mongoose = require("mongoose");

const storeSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: "default.png",
    },
    backgroundImage: {
      type: String,
      default: "default.png",
    },
    description: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    statistics: {
      totalProducts: {
        type: Number,
        default: 0,
      },
      monthlyRevenue: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
      },
      numberOfRatings: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
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

    taxInformation: {
      businessType: {
        type: String,
      },
      businessRegistrationAddress: {
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
      receiveEInvoiceEmail: {
        type: String,
      },
      taxCode: {
        type: String,
      },
    },
    paymentCycle: {
      type: String,
      enum: ["weekly", "monthly"],
      default: "weekly",
    },
    registrationDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
