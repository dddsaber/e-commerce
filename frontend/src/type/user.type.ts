import dayjs from "dayjs";

export interface Address {
  province?: string;
  district?: string;
  ward?: string;
  details?: string;
}

export interface IdentityCard {
  identityNumber?: string;
  fullname?: string;
  photoFront?: string;
  photoBack?: string;
}

export interface GetUsersRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  roles?: string[];
  isActives?: boolean[];
}

export interface User {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  role: "user" | "shipper" | "admin" | "sales";
  avatar?: string;
  gender?: boolean;
  birthday?: dayjs.Dayjs;
  provider?: "local" | "google" | "facebook" | "twitter" | "github";
  providerId?: string;
  description?: string;
  address?: Address;
  identityCard?: IdentityCard;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface authUser {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}
