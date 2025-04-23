const mongoose = require("mongoose");

const userRequestSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    request: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserRequest = mongoose.model("UserRequest", userRequestSchema);

module.exports = UserRequest;
