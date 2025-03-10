import { instance } from ".";
import { GetPaymentsRequest, Payment } from "../type/payment.type";
const URL = "/payment";

// 🟢 Lấy danh sách
export const getPayments = async (
  params: GetPaymentsRequest
): Promise<{ payments: Payment[]; totalPayments: number }> => {
  const response = await instance.post<{
    payments: Payment[];
    totalPayments: number;
  }>(`${URL}/get-payments`, params);

  return response.data;
};

// 🟢 Tạo mới
export const createPayment = async (body: Payment): Promise<Payment> => {
  const response = await instance.post<Payment>(`${URL}/create-payment`, body);

  return response.data;
};

// 🟢 Cập nhật thông tin thanh toán
export const updatePayment = async (
  body: Partial<Payment>
): Promise<Payment> => {
  const response = await instance.put<Payment>(
    `${URL}/${body._id}/update-payment`,
    body
  );

  return response.data;
};

// 🟢 Cập nhật trạng thái thanh toóa
export const updatePaymentStatus = async (
  id: string,
  status: boolean
): Promise<Payment> => {
  const response = await instance.put<Payment>(
    `${URL}/${id}/update-payment-status`,
    { isDeleted: status }
  );

  return response.data;
};

// 🟢 Lấy thông tin thanh toán theo ID
export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await instance.get<Payment>(`${URL}/${id}`);

  return response.data;
};
