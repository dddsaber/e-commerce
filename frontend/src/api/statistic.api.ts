import { instance } from ".";
import {
  CardWrapperInfo,
  RevenueDataChart,
  StoreRevenue,
  StoreRevenueRequest,
} from "../type/statistic.type";
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

export const getStoresRevenue = async (
  params: StoreRevenueRequest
): Promise<StoreRevenue[]> => {
  try {
    const response = await instance.post<StoreRevenue[]>(
      `${URL}/total-and-fees`,
      params
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
    return [];
  }
};

export const getRevenueChartData = async (
  type: string,
  storeId: string
): Promise<RevenueDataChart[]> => {
  try {
    const response = await instance.post<RevenueDataChart[]>(
      `${URL}/revenue-chart`,
      {
        type,
        storeId,
      }
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
    return [];
  }
};

export const getStoresRevenueStats = async (
  storeId: string
): Promise<{ totalRevenue: number; averageMonthlyRevenue: number }> => {
  const response = await instance.get<{
    totalRevenue: number;
    averageMonthlyRevenue: number;
  }>(`${URL}/store-revenue-stats/${storeId}`);
  return response.data;
};
