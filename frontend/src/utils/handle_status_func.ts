import { Coupon } from "../type/coupon.type";
import { STATUS_MAP } from "./constant";

export const checkStatus = (status?: string) => {
  if (!status) return false;
  const check_status =
    status === STATUS_MAP.pending.value ||
    status === STATUS_MAP.confirmed.value;
  return check_status;
};

export const checkCouponApplied = (record: Coupon, storeId: string) => {
  for (const store of record?.storeApplyCoupon || []) {
    if (store.storeId === storeId && !store.isDeleted) {
      return true;
    }
  }
  return false;
};
