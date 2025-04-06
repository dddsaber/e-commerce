import { instance } from ".";
import { Notification } from "../type/notification.type";
const URL = "/notification";

// 🟢 Lấy danh sách người dùng
export const getNotifications = async (
  userId: string
): Promise<{
  notifications: Notification[];
  totalUnreadNotifications: number;
}> => {
  const response = await instance.get<{
    notifications: Notification[];
    totalUnreadNotifications: number;
  }>(`${URL}/user/${userId}`);

  return response.data;
};

export const subscribeNotifications = async (
  userId: string
): Promise<Notification[]> => {
  if (!userId) {
    console.error("❌ userId is undefined or empty!");
    return [];
  }
  const response = await instance.get<Notification[]>(
    `${URL}/subscribe/${userId}`
  );
  return response.data || [];
};

export const readNotification = async (id: string): Promise<Notification> => {
  if (!id) {
    console.error("❌ id is undefined or empty!");
    return {} as Notification;
  }
  const response = await instance.patch<Notification>(`${URL}/${id}/read`);
  return response.data;
};

export const createNotification = async (
  record: unknown
): Promise<Notification> => {
  const response = await instance.post<Notification>(URL, record);
  return response.data;
};
