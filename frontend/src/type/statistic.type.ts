export interface CardWrapperInfo {
  numberOfUsers: number;
  numberOfProducts: number;
  numberOfStores: number;
  totalRevenue: number;
}

export interface StoreRevenue {
  _id: string;
  name: string;
  logo: string;
  total: number;
  coupon: number;
  shippingFee: number;
  totalCommission: number;
  totalTransaction: number;
  totalService: number;
  isActive: boolean;
}

export interface StoreRevenueRequest {
  isActives?: boolean[];
  settleds?: boolean[];
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  storeId?: string;
}

export interface RevenueDataChart {
  time: string;
  revenue: number;
  totalCommission: number;
  totalTransaction: number;
  totalService: number;
}
