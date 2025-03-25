import React from "react";
import { useNotifications } from "../../hook/useNotification";

const NotificationList: React.FC<{ userId: string }> = () => {
  const { notifications } = useNotifications();

  return (
    <div>
      <h3>Thông báo</h3>
      <ul>
        {notifications.map((notif) => (
          <li key={notif._id}>
            <strong>{notif.title}</strong> - {notif.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
