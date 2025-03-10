import dayjs from "dayjs";

export interface StoreApplyCoupon {
  storeId: string;
  isDeleted: boolean;
  appliedDate?: Date;
}

export interface Coupon {
  _id: string;
  name: string;
  userId: string;
  scope?: "all" | "specific";
  type: string;
  value: number;
  appliedDate: dayjs.Dayjs;
  expirationDate: dayjs.Dayjs;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  storeApplyCoupon?: StoreApplyCoupon[];
}

export interface GetCouponsRequest {
  skip?: number;
  limit?: number;
  sortBy?: { field: string; order: "asc" | "desc" };
  isDeleteds?: boolean[];
  searchKey?: string;
  types?: string[];
  value?: number;
  apliedDateBegin?: Date;
  apliedDateEnd?: Date;
  expirationDateBegin?: Date;
  expirationDateEnd?: Date;
  storeId?: string;
  scope?: string;
}
