import { instance } from ".";
import { CardWrapperInfo } from "../type/statistic.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/statistic";

// 🟢 Lấy danh sách người dùng
export const getCardWrapperInfo = async (): Promise<CardWrapperInfo> => {
  try {
    const response = await instance.get<CardWrapperInfo>(`${URL}/`);
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
    return {
      numberOfUsers: 0,
      numberOfProducts: 0,
      numberOfStores: 0,
      totalRevenue: 0,
    };
  }
};
