const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "shipper", "admin", "sales", "logistic_provider"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "default.jpg",
    },
    gender: {
      type: Boolean,
    },
    birthday: {
      type: Date,
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook", "twitter", "github"],
    },
    providerId: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 1000,
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
    identityCard: {
      identityNumber: {
        type: String,
      },
      fullname: {
        type: String,
      },
      identityCardFrontImage: {
        type: String,
      },
      identityCardBackImage: {
        type: String,
      },
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
      expires: "1h",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
