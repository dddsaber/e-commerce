import { Address } from "./store.type";

export interface Warehouse {
  _id: string;
  logistic_provider: string;
  name: string;
  address: Address;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  capacity?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetWarehousesRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  logistic_provider?: string;
  isActives?: boolean[];
  isActive?: boolean;
}
