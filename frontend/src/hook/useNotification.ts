import { useEffect, useState } from "react";
import {
  getNotifications,
  subscribeNotifications,
} from "../api/notification.api";
import { Notification } from "../type/notification.type";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useNotifications = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    console.log(user);
    if (!user || !user._id) {
      console.error("❌ user hoặc user._id bị undefined! Dừng gọi API.");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(user._id);
        setNotifications(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };

    const pollNotifications = async () => {
      try {
        if (!user._id) {
          return;
        }
        const data = await subscribeNotifications(user._id);

        if (data && data.length) {
          setNotifications((prev) => [...data, ...prev]); // Thêm thông báo mới vào danh sách
        }
      } catch (error) {
        console.error("Lỗi kết nối Long Polling:", error);
      } finally {
        setTimeout(pollNotifications, 3000); // Gửi request mới sau 3s
      }
    };

    fetchNotifications();
    pollNotifications();
  }, [user]);

  return { notifications };
};
