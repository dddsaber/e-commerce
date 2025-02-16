import { message } from "antd";
import { AxiosError } from "axios";

export const handleError = (error: unknown): void => {
  if (error instanceof Error) {
    message.error(error.message);
  } else {
    message.error("An error occurred while updating user status.");
  }
};

// Hàm xử lý lỗi API chung
export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    throw new Error(error.response?.data?.message || "Lỗi từ server");
  }
  throw new Error("An unknown error occurred");
};
