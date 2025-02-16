import { message } from "antd";
import { instance } from ".";
import { Cart } from "../type/cart.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/cart";

// 🟢 Lấy gio hang
export const getCart = async (userId: string): Promise<Cart> => {
  try {
    const response = await instance.get<Cart>(`${URL}/${userId}/get-cart`);
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy gio hang");
      return {} as Cart;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Cart;
  }
};

// cap nhat gio hang
export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<Cart> => {
  try {
    const response = await instance.put<Cart>(
      `${URL}/${userId}/update-cart-item`,
      { productId, quantity }
    );
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể cập nhật gio hang");
      return {} as Cart;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Cart;
  }
};

// Them gio hang
export const addCartItem = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<Cart> => {
  try {
    const response = await instance.post<Cart>(
      `${URL}/${userId}/add-cart-item`,
      { productId, quantity }
    );
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể thêm vào gio hang");
      return {} as Cart;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Cart;
  }
};

// Xoa gio hang
export const removeCartItem = async (
  userId: string,
  productId: string
): Promise<Cart> => {
  try {
    const response = await instance.post<Cart>(
      `${URL}/${userId}/remove-cart-item`,
      { productId }
    );
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể xóa sản phẩm kh��i gio hang");
      return {} as Cart;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Cart;
  }
};
