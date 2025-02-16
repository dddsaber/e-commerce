import { Product } from "./product.type";
import { Review } from "./review.type";
import { Store } from "./store.type";
import { User } from "./user.type";

export interface Report {
  _id: string;
  userId: string;
  adminId?: string;
  title: string;
  content: string;
  linkTo?: string;
  reportCategory: string;
  reportedId: string;
  isHandle: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  reportedObject?: User | Product | Store | Review;
}

export interface GetReportsRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  isHandles?: boolean[];
  isDeleteds?: boolean[];
  reportCategories?: string[];
  reportedId?: string;
  userId?: string;
  adminId?: string;
}
