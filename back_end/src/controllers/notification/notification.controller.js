const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");
const response = require("../../utils/response.utils");
const Notification = require("../../models/Notification.model");
const User = require("../../models/User.model");
const { default: mongoose } = require("mongoose");

// ----------------------------------------------------------------
// Update Notification
// ----------------------------------------------------------------
const updateNotification = async (req, res) => {
  const { id } = req.params;
  const { notification } = req.body;
  if (!id || !notification) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  if (
    !notification.userId ||
    !notification.createdBy ||
    !notification.title ||
    !notification.message ||
    !notification.linkTo
  ) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid notification data"
    );
  }
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      notification,
      { new: true }
    );
    if (!updatedNotification) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Notification not found"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      updatedNotification,
      "Notification updated successfully"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get Notification By Created User
// ----------------------------------------------------------------
const getNotificationByCreatedUserId = async (req, res) => {
  const { createdUserId } = req.params;
  if (!createdUserId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const notifications = await Notification.find({
      createdBy: createdUserId,
      isDeleted: false,
    });
    if (!notifications) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Notifications not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      notifications,
      "User's Notifications retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Read Notification
// ----------------------------------------------------------------
const readNotification = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotification) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Notification not found"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      updatedNotification,
      "Notification read successfully"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get Notification by id
// ----------------------------------------------------------------
const getNotificationById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const notification = await getNotificationById(id);
    if (!notification) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Notification not found"
      );
    }

    if (notification.isDeleted) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "Notification has been deleted"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      notification,
      "Notification retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Update Notification's Status
// ----------------------------------------------------------------
const updateNotificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!id || !status) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isDeleted: status },
      { new: true }
    );
    if (!updatedNotification) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Notification not found"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      updatedNotification,
      "Notification status updated successfully"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

let subscribers = {}; // Lưu danh sách kết nối đang chờ

// ----------------------------------------------------------------
// API Long Polling Methods
// ----------------------------------------------------------------
const subscribeNotifications = (req, res) => {
  const { userId } = req.params;
  if (!userId)
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      [],
      "Missing required fields"
    );

  // Lưu kết nối client vào danh sách subscribers
  subscribers[userId] = res;

  // Xóa kết nối nếu client đóng
  req.on("close", () => {
    delete subscribers[userId];
  });
  setTimeout(() => {
    if (subscribers[userId]) {
      response(
        subscribers[userId],
        StatusCodes.NO_CONTENT,
        true,
        [],
        "No new notifications"
      );
      delete subscribers[userId]; // Xóa khỏi danh sách chờ
    }
  }, 30000); // 30 giây
};

// ----------------------------------------------------------------
// Hàm gửi thông báo đến client đang chờ
// ----------------------------------------------------------------
const sendNotification = (notification) => {
  const userId = notification.userId.toString();
  if (subscribers[userId]) {
    response(
      subscribers[userId],
      StatusCodes.OK,
      true,
      [notification],
      "New notification received"
    );
    delete subscribers[userId];
  }
};

// ----------------------------------------------------------------
// Get Notifications By UserId
// ----------------------------------------------------------------
const getNotificationsByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const totalUnreadNotifications = await Notification.countDocuments({
      userId: userId,
      isRead: false,
      isDeleted: false,
    });
    const notifications = await Notification.find({
      userId: userId,
      isDeleted: false,
    })
      .limit(5)
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "avatar", // lấy avatar thôi
      });

    // Gán image = createdBy.avatar
    const notificationsWithImage = notifications.map((noti) => {
      return {
        ...noti.toObject(),
        image: noti.createdBy?.avatar || null,
      };
    });

    return response(
      res,
      StatusCodes.OK,
      true,
      {
        notifications: notificationsWithImage,
        totalUnreadNotifications: totalUnreadNotifications,
      },
      "User's Notifications retrieved successfully"
    );
  } catch (error) {
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      [],
      "Error retrieving notifications"
    );
  }
};

// ----------------------------------------------------------------
// Create Notification
// ----------------------------------------------------------------
const createNotification = async (req, res) => {
  const {
    userId,
    createdBy,
    title,
    message,
    target,
    targetModel,
    ...otherFields
  } = req.body;
  console.log(req.body);
  if (!userId || !createdBy || !title || !message) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }

  if (!target || !targetModel) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing target or targetModel"
    );
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }

    const newNotification = await Notification.create({
      userId: userId,
      createdBy: createdBy,
      title: title,
      message: message,
      target: target,
      targetModel: targetModel,
      isRead: false,
      isDeleted: false,
      ...otherFields,
    });

    if (!newNotification) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create notification"
      );
    }

    sendNotification(newNotification);

    return response(
      res,
      StatusCodes.CREATED,
      true,
      newNotification,
      "New notification created"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------
module.exports = {
  createNotification,
  updateNotification,
  getNotificationsByUserId,
  getNotificationByCreatedUserId,
  readNotification,
  updateNotificationStatus,
  getNotificationById,
  subscribeNotifications,
};
