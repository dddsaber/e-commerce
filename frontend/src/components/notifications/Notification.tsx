import React from "react";
import { Notification } from "../../type/notification.type";
import { Col, Image, message, Row, Typography } from "antd";
import { getSourceImage } from "../../utils/handle_image_func";
import "./NotificationCard.css";
import { useNavigate } from "react-router-dom";
import { readNotification } from "../../api/notification.api";

interface NotificationCardProps {
  item: Notification;
}

const NotificationCardM: React.FC<NotificationCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const handleRead = async () => {
    if (!item.isRead) {
      const data = await readNotification(item._id);
      if (!data) {
        message.error("Lỗi xảy ra!");
      }
    }
    navigate(
      `/${
        item.targetModel === "Order"
          ? "account/" + item.targetModel.toLocaleLowerCase()
          : item.targetModel
      }/${item.target}`
    );
  };

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
      onClick={() => handleRead()}
    >
      <Col span={4}>
        <Image
          src={getSourceImage(item.image || "")}
          style={{ height: 45, width: 45 }}
        />
      </Col>
      <Col span={20}>
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
