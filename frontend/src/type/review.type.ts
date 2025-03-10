export interface Review {
  _id: string;
  userId: string;
  productId: string;
  content: string;
  rating: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    name: string;
    username: string;
    avatar: string;
  };
  product?: {
    name: string;
  };
}

export interface GetReviewsRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  isDeleteds?: boolean[];
  ratings?: number[];
  productId?: string;
  storeId?: string;
}
