import { instance } from ".";
import { GetOrdersRequest, Order } from "../type/order.type";
const URL = "/order";

// 🟢 Tạo mới order
export const createOrder = async (body: Order): Promise<Order> => {
  const response = await instance.post<Order>(`${URL}/create-order`, body);

  return response.data;
};

// Lấy danh sách đơn hàng
export const getOrders = async (
  params: GetOrdersRequest
): Promise<{ orders: Order[]; totalOrders: number }> => {
  const response = await instance.post<{
    orders: Order[];
    totalOrders: number;
  }>(`${URL}/get-orders`, params);
  return response.data;
};

// Update status
export const updateOrderStatus = async (
  id: string,
  status: string
): Promise<Order> => {
  const response = await instance.put<Order>(
    `${URL}/${id}/update-order-status`,
    { status }
  );

  return response.data;
};

// Update status
export const cancelOrder = async (
  id: string,
  cancelNote?: string
): Promise<Order> => {
  const response = await instance.put<Order>(`${URL}/${id}/cancel-order`, {
    cancelNote,
  });

  return response.data;
};

// Get order details
export const getOrderById = async (id: string): Promise<Order> => {
  const response = await instance.get<Order>(`${URL}/${id}/order`);
  return response.data;
};

export const getOrderStatusCount = async (
  id: string
): Promise<{
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
}> => {
  const response = await instance.get<{
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    completed: number;
    cancelled: number;
  }>(`${URL}/${id}/get-order-status-count`);
  return response.data;
};
