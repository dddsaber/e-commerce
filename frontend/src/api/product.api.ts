import { message } from "antd";
import { instance } from ".";
import { GetProductsRequest, Product, Receipt } from "../type/product.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/product";

// 🟢 Lấy danh sách người dùng
export const getProducts = async (
  params: GetProductsRequest
): Promise<{ products: Product[]; totalProducts: number }> => {
  try {
    const response = await instance.post<{
      products: Product[];
      totalProducts: number;
    }>(`${URL}/get-products`, params);
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy danh sách người dùng");
      return { products: [], totalProducts: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { products: [], totalProducts: 0 };
  }
};

// 🟢 Tạo mới người dùng
export const createProduct = async (body: Product): Promise<Product> => {
  try {
    const response = await instance.post<Product>(
      `${URL}/create-product`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo người dùng");
      return {} as Product;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Product;
  }
};

// 🟢 Tạo receipt nhap kho
export const createReceipt = async (body: Receipt): Promise<Receipt> => {
  try {
    const response = await instance.post<Receipt>(
      `receipt/create-receipt`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo người dùng");
      return {} as Receipt;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Receipt;
  }
};

// 🟢 Cập nhật thông tin người dùng
export const updateProduct = async (
  body: Partial<Product>
): Promise<Product> => {
  try {
    const response = await instance.put<Product>(
      `${URL}/${body._id}/update-product`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật người dùng");
      return {} as Product;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Product;
  }
};

// 🟢 Cập nhật trạng thái người dùng
export const updateProductStatus = async (
  id: string,
  status: boolean
): Promise<Product> => {
  try {
    const response = await instance.put<Product>(
      `${URL}/${id}/update-product-status`,
      { status }
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật trạng thái người dùng");
      return {} as Product;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Product;
  }
};

// 🟢 Lấy thông tin người dùng theo ID
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await instance.get<Product>(`${URL}/${id}`);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin người dùng");
      return {} as Product;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Product;
  }
};
