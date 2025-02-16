import { message } from "antd";
import { instance } from ".";
import { GetCouponsRequest, Coupon } from "../type/coupon.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/coupon";

// 🟢 Lấy danh sách phiếu giảm giá
export const getCoupons = async (
  params: GetCouponsRequest
): Promise<{ coupons: Coupon[]; totalCoupons: number }> => {
  try {
    const response = await instance.post<{
      coupons: Coupon[];
      totalCoupons: number;
    }>(`${URL}/get-coupons`, params);
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy danh sách phiếu giảm giá");
      return { coupons: [], totalCoupons: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { coupons: [], totalCoupons: 0 };
  }
};

// 🟢 Tạo mới phiếu giảm giá
export const createCoupon = async (body: Coupon): Promise<Coupon> => {
  try {
    const response = await instance.post<Coupon>(`${URL}/create-coupon`, body);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo phiếu giảm giá");
      return {} as Coupon;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Coupon;
  }
};

// 🟢 Cập nhật thông tin phiếu giảm giá
export const updateCoupon = async (body: Partial<Coupon>): Promise<Coupon> => {
  try {
    const response = await instance.put<Coupon>(
      `${URL}/${body._id}/update-coupon`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật phiếu giảm giá");
      return {} as Coupon;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Coupon;
  }
};

// 🟢 Cập nhật trạng thái phiếu giảm giá
export const updateCouponStatus = async (
  id: string,
  status: boolean
): Promise<Coupon> => {
  try {
    const response = await instance.put<Coupon>(
      `${URL}/${id}/update-coupon-status`,
      { isDeleted: status }
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật trạng thái phiếu giảm giá");
      return {} as Coupon;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Coupon;
  }
};

// 🟢 Lấy thông tin phiếu giảm giá theo ID
export const getCouponById = async (id: string): Promise<Coupon> => {
  try {
    const response = await instance.get<Coupon>(`${URL}/${id}`);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin phiếu giảm giá");
      return {} as Coupon;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Coupon;
  }
};
