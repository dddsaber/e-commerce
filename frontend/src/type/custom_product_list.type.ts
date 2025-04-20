import { Product } from "./product.type";

export interface CustomProductListInput {
  storeId: string;
  name: string;
  description?: string;
  image?: string;
  productIds: string[];
  order: number;
}

export interface CustomProductList {
  _id: string;
  storeId: string;
  name: string;
  description?: string;
  image?: string;
  products: Product[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
