import { Col, Image, Row, Typography } from "antd";
import React from "react";
import { Notification } from "../../type/notification.type";
import { formatDate } from "../../utils/handle_format_func";
import "./NotificationCard.css";
import { getSourceImage } from "../../utils/handle_image_func";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hook/useNotification";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  const handleRead = async () => {
    if (!notification.isRead) markAsRead(notification._id);

    navigate(
      `/${
        notification.targetModel === "Order"
          ? "account/" + notification.targetModel.toLocaleLowerCase()
          : notification.targetModel
      }/${notification.target}`
    );
  };

  return (
    <Row
      style={{
        backgroundColor: notification.isRead ? "transparent" : "#fdf1ed",
        cursor: "pointer",
      }}
      className="change-color-hover"
      gutter={[20, 20]}
      onClick={handleRead}
    >
      <Col span={3} style={{ margin: 15 }}>
        <Image
          src={getSourceImage(notification.image || "")}
          className="square"
        />
      </Col>
      <Col span={18} style={{ marginLeft: 10 }}>
        <Typography.Title level={5} style={{ marginTop: 15 }}>
          {notification.title}
        </Typography.Title>
        <Typography.Text>{notification.message}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ marginTop: 5 }}>
          {formatDate(notification.createdAt)}
        </Typography.Text>
      </Col>
    </Row>
  );
};

export default NotificationCard;
