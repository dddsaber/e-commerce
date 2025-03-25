// frontend/types/store.ts
export interface Statistics {
  totalProducts: number;
  monthlyRevenue: number;
  rating: number;
  numberOfRatings: number;
  totalRevenue: number;
  visited: number;
}

export interface Address {
  province?: string;
  district?: string;
  ward?: string;
  details?: string;
}

export interface UserRefDetails {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
}

export interface TaxInformation {
  businessType: string;
  taxCode?: string;
  receiveEInvoiceEmail: string;
  businessRegistrationAddress: Address;
}

export interface Store {
  _id?: string;
  userId: string; // Reference tới userId
  name: string;
  logo?: string;
  backgroundImage?: string;
  email: string;
  phone: string;
  statistics?: Statistics;
  address?: Address;
  description?: string;
  taxInformation?: TaxInformation;
  registrationDate?: Date;
  isActive?: boolean;
  user?: UserRefDetails; // Optional field, được join từ User Collection trong backend
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetStoresRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  isActives?: boolean[];
}
