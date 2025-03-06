import { message } from "antd";
import { instance } from ".";
import { GetPaymentsRequest, Payment } from "../type/payment.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/payment";

// 🟢 Lấy danh sách
export const getPayments = async (
  params: GetPaymentsRequest
): Promise<{ payments: Payment[]; totalPayments: number }> => {
  try {
    const response = await instance.post<{
      payments: Payment[];
      totalPayments: number;
    }>(`${URL}/get-payments`, params);
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy danh sách loại thanh toán");
      return { payments: [], totalPayments: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { payments: [], totalPayments: 0 };
  }
};

// 🟢 Tạo mới
export const createPayment = async (body: Payment): Promise<Payment> => {
  try {
    const response = await instance.post<Payment>(
      `${URL}/create-payment`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo loại thanh toán");
      return {} as Payment;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Payment;
  }
};

// 🟢 Cập nhật thông tin thanh toán
export const updatePayment = async (
  body: Partial<Payment>
): Promise<Payment> => {
  try {
    const response = await instance.put<Payment>(
      `${URL}/${body._id}/update-payment`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật loại thanh toán");
      return {} as Payment;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Payment;
  }
};

// 🟢 Cập nhật trạng thái thanh toóa
export const updatePaymentStatus = async (
  id: string,
  status: boolean
): Promise<Payment> => {
  try {
    const response = await instance.put<Payment>(
      `${URL}/${id}/update-payment-status`,
      { isDeleted: status }
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật trạng thái thanh toán");
      return {} as Payment;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Payment;
  }
};

// 🟢 Lấy thông tin thanh toán theo ID
export const getPaymentById = async (id: string): Promise<Payment> => {
  try {
    const response = await instance.get<Payment>(`${URL}/${id}`);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin thanh toán");
      return {} as Payment;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Payment;
  }
};
