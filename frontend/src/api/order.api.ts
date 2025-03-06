import { message } from "antd";
import { instance } from ".";
import { GetOrdersRequest, Order } from "../type/order.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/order";

// 🟢 Tạo mới order
export const createOrder = async (body: Order): Promise<Order> => {
  try {
    const response = await instance.post<Order>(`${URL}/create-order`, body);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo order");
      return {} as Order;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Order;
  }
};

// Lấy danh sách đơn hàng
export const getOrders = async (
  params: GetOrdersRequest
): Promise<{ orders: Order[]; totalOrders: number }> => {
  try {
    const response = await instance.post<{
      orders: Order[];
      totalOrders: number;
    }>(`${URL}/get-orders`, params);

    if (response.status) {
      return response.data; // Trả về cả danh sách orders và tổng số orders
    } else {
      message.error("Không thể lấy danh sách báo cáo");
      return { orders: [], totalOrders: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { orders: [], totalOrders: 0 }; // Đảm bảo trả về cả orders và totalOrders mặc định là 0
  }
};
