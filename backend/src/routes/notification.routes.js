const { Router } = require("express");
const {
  createNotification,
  updateNotification,
  getNotificationsByUserId,
  getNotificationByCreatedUserId,
  readNotification,
  updateNotificationStatus,
  getNotificationById,
  subscribeNotifications,
} = require("../controllers/notification/notification.controller");

const router = Router();

router.post("/", createNotification);

router.put("/:id", updateNotification);

router.get("/user/:userId", getNotificationsByUserId);

router.get("/subscribe/:userId", subscribeNotifications);

router.get("/created-user/:createdUserId", getNotificationByCreatedUserId);

router.patch("/:id/read", readNotification);

router.patch("/:id/status", updateNotificationStatus);

router.get("/:id", getNotificationById);

module.exports = router;
