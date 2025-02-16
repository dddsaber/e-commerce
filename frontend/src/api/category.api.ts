import { message } from "antd";
import { instance } from ".";
import { GetCategoryRequest, Category } from "../type/category.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/category";

// 🟢 Lấy danh sách
export const getCategories = async (
  params: GetCategoryRequest
): Promise<{ categories: Category[]; totalCategories: number }> => {
  try {
    const response = await instance.post<{
      categories: Category[];
      totalCategories: number;
    }>(`${URL}/get-categories`, params);
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy danh sách");
      return { categories: [], totalCategories: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { categories: [], totalCategories: 0 };
  }
};

// 🟢 Lấy danh sách cac categories co the chon
export const getSelectCategories = async (): Promise<Category[]> => {
  try {
    const response = await instance.get<Category[]>(
      `${URL}/get-select-categories`
    );

    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy danh sách!");
      return [];
    }
  } catch (error: unknown) {
    handleApiError(error);
    return [];
  }
};

// 🟢 Tạo mới
export const createCategory = async (body: Category): Promise<Category> => {
  try {
    const response = await instance.post<Category>(
      `${URL}/create-category`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo người dùng");
      return {} as Category;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Category;
  }
};

// 🟢 Cập nhật thông tin
export const updateCategory = async (
  body: Partial<Category>
): Promise<Category> => {
  try {
    const response = await instance.put<Category>(
      `${URL}/${body._id}/update-info`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật người dùng");
      return {} as Category;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Category;
  }
};

// 🟢 Cập nhật trạng thái người dùng
export const updateCategoryStatus = async (
  id: string,
  status: boolean
): Promise<Category> => {
  try {
    const response = await instance.put<Category>(
      `${URL}/${id}/update-status`,
      { status }
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật trạng thái người dùng");
      return {} as Category;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Category;
  }
};

// 🟢 Lấy thông tin  theo ID
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await instance.get<Category>(`${URL}/${id}/get-by-id`);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin người dùng");
      return {} as Category;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Category;
  }
};

// 🟢 Lấy thông tin  theo Parent ID
export const getCategoryByParentId = async (
  id: string
): Promise<Category[]> => {
  try {
    const response = await instance.get<Category[]>(
      `${URL}/${id}/get-by-parentId`
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin người dùng");
      return [];
    }
  } catch (error: unknown) {
    handleApiError(error);
    return [];
  }
};
