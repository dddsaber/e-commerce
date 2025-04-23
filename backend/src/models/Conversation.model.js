const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    name: String,
    participants: {
      type: [String],
      ref: "User",
      default: [],
      required: true,
    },
    lastMessage: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
