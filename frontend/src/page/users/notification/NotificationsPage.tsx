import { useState } from "react";
import { Card, Button } from "antd";
import NotificationCard from "../../../components/notifications/NotificationCard";
import { useNotifications } from "../../../hook/useNotification";

const NotificationsPage = () => {
  const { notifications } = useNotifications();
  const [showAll, setShowAll] = useState(false);

  // Hiển thị tối đa 6 thông báo nếu chưa bấm "Xem tất cả"
  const visibleNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  return (
    <Card>
      <p className="read-all">Đánh dấu đã đọc tất cả</p>

      {visibleNotifications.map((notification, index) => (
        <NotificationCard key={index} notification={notification} />
      ))}

      {/* Nút "Xem tất cả" chỉ hiển thị nếu chưa bấm */}
      <p style={{ textAlign: "right" }}>
        {!showAll && (
          <Button type="link" onClick={() => setShowAll(true)}>
            Xem tất cả
          </Button>
        )}
      </p>
    </Card>
  );
};

export default NotificationsPage;
