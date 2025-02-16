export interface GetSubCategoryRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  isDeleteds?: boolean[];
}

export interface SubCategory {
  categoryId: string;
  _id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
