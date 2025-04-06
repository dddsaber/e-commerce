import React from "react";
import { Notification } from "../../type/notification.type";
import { Col, Image, Row, Typography } from "antd";
import { getSourceImage } from "../../utils/handle_image_func";
import "./NotificationCard.css";

interface NotificationCardProps {
  item: Notification;
}

const NotificationCardM: React.FC<NotificationCardProps> = ({ item }) => {
  return (
    <Row
      gutter={[12, 12]}
      style={{
        margin: 0,
        padding: "10px 40px 5px 10px",
        backgroundColor: item.isRead ? "transparent" : "#fdf1ed",
        cursor: "pointer",
      }}
      className="change-color-hover"
    >
      <Col span={6}>
        <Image
          src={getSourceImage(item.image || "")}
          style={{ height: 45, width: 45 }}
        />
      </Col>
      <Col span={18}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {item.title}
        </Typography.Title>
        <Typography.Text
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.message}
        </Typography.Text>
      </Col>
    </Row>
  );
};

export default NotificationCardM;
