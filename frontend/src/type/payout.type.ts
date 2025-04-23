export interface Payout {
  _id: string;
  storeId: string;
  orders: string[];
  totalPayout: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetPayoutsRequest {
  skip?: number;
  limit?: number;
  sortBy?: { field: string; order: "asc" | "desc" };
  storeId?: string;
}
