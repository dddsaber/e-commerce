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
  isDeleted: string;
  items: CartItem[];
}
