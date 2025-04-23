const mongoose = require("mongoose");

const followSchema = mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isFollowed: {
      type: Boolean, // Đổi 'boolean' thành 'Boolean'
      required: true, // sửa 'require' thành 'required'
      default: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;
