export interface GetCategoryRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  isDeleteds?: boolean[];
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  parentId?: {
    _id: string;
    name: string;
  };
}
