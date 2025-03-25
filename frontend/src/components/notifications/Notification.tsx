import React from "react";
import { Notification } from "../../type/notification.type";
import { Col, Row, Typography } from "antd";
import { BellFilled } from "@ant-design/icons";

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
        backgroundColor: item.isRead ? "transparent" : "#f1f1f1",
      }}
    >
      <Col span={4}>
        <BellFilled style={{ height: 30, width: 30 }} />
      </Col>
      <Col span={20}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {item.title}
        </Typography.Title>
        <Typography.Text>{item.message}</Typography.Text>
      </Col>
    </Row>
  );
};

export default NotificationCardM;
