import { Address } from "./user.type";

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  image?: string;
  _id: string;
}

export interface Cart {
  _id: string;
  userId: string;
  isDeleted: boolean;
  items: {
    storeId: string;
    storeName: string;
    storeAddress: Address;
    logo: string;
    products: CartItem[];
  }[];
}
