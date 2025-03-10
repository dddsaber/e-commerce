import { instance } from ".";
import { GetCouponsRequest, Coupon } from "../type/coupon.type";
const URL = "/coupon";

// 🟢 Lấy danh sách phiếu giảm giá
export const getCoupons = async (
  params: GetCouponsRequest
): Promise<{ coupons: Coupon[]; totalCoupons: number }> => {
  const response = await instance.post<{
    coupons: Coupon[];
    totalCoupons: number;
  }>(`${URL}/get-coupons`, params);
  return response.data;
};

// 🟢 Tạo mới phiếu giảm giá
export const createCoupon = async (body: Coupon): Promise<Coupon> => {
  const response = await instance.post<Coupon>(`${URL}/create-coupon`, body);
  return response.data;
};

// 🟢 Cập nhật thông tin phiếu giảm giá
export const updateCoupon = async (body: Partial<Coupon>): Promise<Coupon> => {
  const response = await instance.put<Coupon>(
    `${URL}/${body._id}/update-coupon`,
    body
  );
  return response.data;
};

// 🟢 Cập nhật trạng thái phiếu giảm giá
export const updateCouponStatus = async (
  id: string,
  status: boolean
): Promise<Coupon> => {
  const response = await instance.put<Coupon>(
    `${URL}/${id}/update-coupon-status`,
    { isDeleted: status }
  );
  return response.data;
};

// 🟢 Lấy thông tin phiếu giảm giá theo ID
export const getCouponById = async (id: string): Promise<Coupon> => {
  const response = await instance.get<Coupon>(`${URL}/${id}`);
  return response.data;
};

// Apply Coupon to store
// 🟢 Cập nhật trạng thái phiếu giảm giá
export const applyCouponToStore = async (
  couponId: string,
  storeId: string
): Promise<Coupon> => {
  const response = await instance.post<Coupon>(`${URL}/apply-to-store`, {
    couponId,
    storeId,
  });

  return response.data;
};
