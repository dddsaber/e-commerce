const mongoose = require("mongoose");

const userActivationsSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activationCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const userActivations = mongoose.model(
  "UserActivations",
  userActivationsSchema
);

module.exports = userActivations;
