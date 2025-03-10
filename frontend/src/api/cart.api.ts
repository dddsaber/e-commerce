import { instance } from ".";
import { Cart } from "../type/cart.type";
const URL = "/cart";

// 🟢 Lấy gio hang
export const getCart = async (userId: string): Promise<Cart> => {
  const response = await instance.get<Cart>(`${URL}/${userId}/get-cart`);
  return response.data;
};

// cap nhat gio hang
export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<Cart> => {
  const response = await instance.put<Cart>(
    `${URL}/${userId}/update-cart-item`,
    { productId, quantity }
  );
  return response.data;
};

// Them gio hang
export const addCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<Cart> => {
  const response = await instance.post<Cart>(`${URL}/${userId}/add-cart-item`, {
    productId,
    quantity,
  });
  return response.data;
};

// Xoa gio hang
export const removeCartItem = async (
  userId: string,
  productId: string
): Promise<Cart> => {
  const response = await instance.post<Cart>(
    `${URL}/${userId}/remove-cart-item`,
    { productId }
  );
  return response.data;
};
