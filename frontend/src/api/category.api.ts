import { instance } from ".";
import { GetCategoryRequest, Category } from "../type/category.type";
const URL = "/category";

// 🟢 Lấy danh sách
export const getCategories = async (
  params: GetCategoryRequest
): Promise<{ categories: Category[]; totalCategories: number }> => {
  const response = await instance.post<{
    categories: Category[];
    totalCategories: number;
  }>(`${URL}/get-categories`, params);
  return response.data;
};

// 🟢 Lấy danh sách cac categories co the chon
export const getSelectCategories = async (): Promise<Category[]> => {
  const response = await instance.get<Category[]>(
    `${URL}/get-select-categories`
  );
  return response.data;
};

// 🟢 Tạo mới
export const createCategory = async (body: Category): Promise<Category> => {
  const response = await instance.post<Category>(
    `${URL}/create-category`,
    body
  );
  return response.data;
};

// 🟢 Cập nhật thông tin
export const updateCategory = async (
  body: Partial<Category>
): Promise<Category> => {
  const response = await instance.put<Category>(
    `${URL}/${body._id}/update-info`,
    body
  );
  return response.data;
};

// 🟢 Cập nhật trạng thái người dùng
export const updateCategoryStatus = async (
  id: string,
  status: boolean
): Promise<Category> => {
  const response = await instance.put<Category>(`${URL}/${id}/update-status`, {
    status,
  });
  return response.data;
};

// 🟢 Lấy thông tin  theo ID
export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await instance.get<Category>(`${URL}/${id}/get-by-id`);
  return response.data;
};

// 🟢 Lấy thông tin  theo Parent ID
export const getCategoryByParentId = async (
  id: string
): Promise<Category[]> => {
  const response = await instance.get<Category[]>(
    `${URL}/${id}/get-by-parentId`
  );
  return response.data;
};
