import { useEffect, useState, useCallback } from "react";
import {
  getNotifications,
  subscribeNotifications,
  readNotification,
} from "../api/notification.api";
import { Notification } from "../type/notification.type";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export const useNotifications = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalUnreadNotifications, setTotalUnreadNotifications] =
    useState<number>(0);

  /*──────── fetch toàn bộ danh sách ───────*/
  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const data = await getNotifications(user._id);
      setNotifications(data.notifications);
      setTotalUnreadNotifications(data.totalUnreadNotifications);
    } catch (err) {
      console.error("Lỗi khi lấy thông báo:", err);
    }
  }, [user?._id]);

  /*──────────────── markAsRead ─────────────*/
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await readNotification(id);
        await fetchNotifications(); // refetch lại danh sách đầy đủ
        console.log(totalUnreadNotifications);
      } catch (err) {
        console.error("readNotification error", err);
        // rollback
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
        );
        setTotalUnreadNotifications((prev) => prev + 1);
      }
    },
    [fetchNotifications]
  );

  /*──────── long‑polling chỉ đẩy noti mới ────────*/
  useEffect(() => {
    if (!user?._id) return;

    const poll = async () => {
      try {
        const data = await subscribeNotifications(user._id);
        if (data?.length) {
          setNotifications((prev) => {
            const existing = new Set(prev.map((n) => n._id));
            const fresh = data.filter((n) => !existing.has(n._id));
            if (!fresh.length) return prev;
            setTotalUnreadNotifications((cnt) => cnt + fresh.length);
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.error("Lỗi long‑polling:", err);
      } finally {
        setTimeout(poll, 3000);
      }
    };

    fetchNotifications(); // lấy lần đầu
    poll(); // bắt đầu long‑poll

    // optional: cleanup nếu cần huỷ timeout (ở spa thì thường không cần)
    // return () => clearTimeout(timeoutId);
  }, [user, fetchNotifications]);

  return { notifications, totalUnreadNotifications, markAsRead };
};
