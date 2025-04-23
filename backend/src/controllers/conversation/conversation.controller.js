const { StatusCodes } = require("http-status-codes");
const Conversation = require("../../models/Conversation.model");
const response = require("../../utils/response.utils");
const dayjs = require("dayjs");
const { TYPE_USER } = require("../../utils/constants.utils");
const Store = require("../../models/Store.model");

exports.createConversation = async (req, res) => {
  try {
    const { name = "", participants, lastMessage = "" } = req.body;

    const newConversation = await Conversation.create({
      name,
      participants,
      lastMessage,
    });

    let conversation = await Conversation.findById(newConversation._id)
      .populate({
        path: "participants",
        select: "name phone email avatar role",
      })
      .lean(); // Sử dụng `.lean()` để có thể chỉnh sửa object

    // Tìm tất cả store có `userId` trùng với `sales`
    const storePromises = conversation.participants.map(async (user) => {
      if (user.role === TYPE_USER.sales) {
        const store = await Store.findOne({ userId: user._id }).select(
          "name logo"
        );
        if (store) {
          return {
            ...user,
            name: store.name, // Gán name theo store
            avatar: store.logo, // Gán avatar theo store
          };
        }
      }
      return user;
    });

    // Chờ tất cả promises hoàn thành
    conversation.participants = await Promise.all(storePromises);

    return response(res, StatusCodes.ACCEPTED, true, conversation, null);
  } catch (error) {
    console.error(error);
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      { conversation: {} },
      "Error creating conversation"
    );
  }
};

// Read (Retrieve) a conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    return response(res, StatusCodes.ACCEPTED, true, { conversation }, null);
  } catch (error) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      true,
      { conversation: {} },
      null
    );
  }
};

// Read (Retrieve) a conversation by UserUd

exports.getConversationByUserid = async (req, res) => {
  try {
    const { userId } = req.body;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate({
        path: "participants",
        select: "name phone email avatar role",
      })
      .sort({ updatedAt: -1 })
      .lean(); // Dùng `.lean()` để có thể chỉnh sửa dữ liệu

    // Xử lý thay đổi name và avatar nếu user có role "sales"
    for (const conversation of conversations) {
      conversation.participants = await Promise.all(
        conversation.participants.map(async (user) => {
          if (user.role === TYPE_USER.sales) {
            const store = await Store.findOne({ userId: user._id }).select(
              "name logo"
            );
            if (store) {
              return {
                ...user,
                name: store.name, // Thay name bằng store.name
                avatar: store.logo, // Thay avatar bằng store.logo
              };
            }
          }
          return user;
        })
      );
    }

    return response(res, StatusCodes.ACCEPTED, true, conversations, null);
  } catch (error) {
    console.error(error);
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      [],
      "Error fetching conversations"
    );
  }
};

// Update a conversation by ID
exports.updateConversation = async (id) => {
  try {
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      {
        updatedAt: dayjs().toISOString(),
      },
      {
        new: true,
      }
    );
    console.log("====================================");
    console.log(conversation);
    console.log("====================================");
    if (!conversation) {
      return null;
    }
  } catch (error) {
    return null;
  }
};

// Delete a conversation by ID
exports.deleteConversation = async (req, res) => {
  try {
    const deletedConversation = await Conversation.findByIdAndDelete(
      req.params.id
    );
    if (!deletedConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    return response(
      res,
      StatusCodes.ACCEPTED,
      true,
      { conversation: deletedConversation },
      null
    );
  } catch (error) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      true,
      { conversation: {} },
      null
    );
  }
};
