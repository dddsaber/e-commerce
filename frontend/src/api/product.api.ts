import { instance } from ".";
import {
  GetProductsRequest,
  Inventory,
  Product,
  Receipt,
} from "../type/product.type";
const URL = "/product";

// 🟢 Lấy danh sách người dùng
export const getProducts = async (
  params: GetProductsRequest
): Promise<{ products: Product[]; totalProducts: number }> => {
  const response = await instance.post<{
    products: Product[];
    totalProducts: number;
  }>(`${URL}/get-products`, params);

  return response.data;
};

// 🟢 Tạo mới người dùng
export const createProduct = async (body: Product): Promise<Product> => {
  const response = await instance.post<Product>(`${URL}/create-product`, body);
  return response.data;
};

// 🟢 Tạo receipt nhap kho
export const createReceipt = async (body: Receipt): Promise<Receipt> => {
  const response = await instance.post<Receipt>(`receipt/create-receipt`, body);
  return response.data;
};

// 🟢 Cập nhật thông tin người dùng
export const updateProduct = async (
  body: Partial<Product>
): Promise<Product> => {
  const response = await instance.put<Product>(
    `${URL}/${body._id}/update-product`,
    body
  );

  return response.data;
};

// 🟢 Cập nhật trạng thái người dùng
export const updateProductStatus = async (
  id: string,
  status: boolean
): Promise<Product> => {
  const response = await instance.put<Product>(
    `${URL}/${id}/update-product-status`,
    { status }
  );

  return response.data;
};

// 🟢 Lấy thông tin người dùng theo ID
export const getProductById = async (id: string): Promise<Product> => {
  const response = await instance.get<Product>(`${URL}/${id}`);

  return response.data;
};

// lay rate va sold
export const getRateAndSold = async (
  id: string
): Promise<{ totalReviews: number; rating: number; inventory: Inventory }> => {
  const response = await instance.get<{
    totalReviews: number;
    rating: number;
    inventory: Inventory;
  }>(`${URL}/${id}/rate-and-sold`);

  return response.data;
};
