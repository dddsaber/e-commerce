export interface Receipt {
  _id: string;
  inventoryId: string;
  quantity: number;
  provider?: string;
}

export interface Inventory {
  _id?: string;
  productId?: string;
  quantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface GetProductsRequest {
  skip?: number;
  limit?: number;
  searchKey?: string;
  sortBy?: { field: string; order: "asc" | "desc" };
  costMin?: number;
  costMax?: number;
  priceMin?: number;
  priceMax?: number;
  storeId?: string;
  rating?: number;
  categoryIds?: string[];
  isActives?: boolean[];
}

export interface Product {
  _id: string;
  categoryId?: string;
  storeId?: string;
  name: string;
  cost: number;
  price: number;
  discount?: number;
  image?: string;
  sideImages?: string[];
  description?: string;
  size?: string;
  rating?: number;
  numberOfRatings?: number;
  isActive: boolean;
  inventory?: Inventory;
  category: {
    _id: string;
    name: string;
  };
  store: {
    name: string;
    logo: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
