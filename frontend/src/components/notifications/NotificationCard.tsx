import { Col, Image, Row, Typography } from "antd";
import React, { useState } from "react";
import { Notification } from "../../type/notification.type";
import { formatDate } from "../../utils/handle_format_func";
import "./NotificationCard.css";
import { readNotification } from "../../api/notification.api";
import { getSourceImage } from "../../utils/handle_image_func";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
}) => {
  const [isRead, setIsRead] = useState(notification.isRead);

  const handleRead = async () => {
    if (!isRead) {
      setIsRead(true); // Cập nhật ngay lập tức trên UI
      const data = await readNotification(notification._id);
      if (!data) setIsRead(false); // Nếu API lỗi, rollback lại trạng thái
    }
  };

  return (
    <Row
      style={{
        backgroundColor: isRead ? "transparent" : "#fdf1ed",
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
