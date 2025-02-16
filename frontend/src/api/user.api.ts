import { message } from "antd";
import { instance } from ".";
import { GetUsersRequest, User } from "../type/user.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/user";

// 🟢 Lấy danh sách người dùng
export const getUsers = async (
  params: GetUsersRequest
): Promise<{ users: User[]; totalUsers: number }> => {
  try {
    const response = await instance.post<{ users: User[]; totalUsers: number }>(
      `${URL}/get-users`,
      params
    );
    if (response.status) {
      return response.data;
    } else {
      message.error("Không thể lấy danh sách người dùng");
      return { users: [], totalUsers: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { users: [], totalUsers: 0 };
  }
};

// 🟢 Tạo mới người dùng
export const createUser = async (body: User): Promise<User> => {
  try {
    const response = await instance.post<User>(`${URL}/create-user`, body);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể tạo người dùng");
      return {} as User;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as User;
  }
};

// 🟢 Cập nhật thông tin người dùng
export const updateUser = async (body: Partial<User>): Promise<User> => {
  try {
    const response = await instance.put<User>(
      `${URL}/${body._id}/update-user`,
      body
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật người dùng");
      return {} as User;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as User;
  }
};

// 🟢 Cập nhật trạng thái người dùng
export const updateUserStatus = async (
  id: string,
  status: boolean
): Promise<User> => {
  try {
    const response = await instance.put<User>(
      `${URL}/${id}/update-user-status`,
      { status }
    );
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể cập nhật trạng thái người dùng");
      return {} as User;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as User;
  }
};

// 🟢 Lấy thông tin người dùng theo ID
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await instance.get<User>(`${URL}/${id}`);
    if (response.status) {
      // Kiểm tra status thành công
      return response.data;
    } else {
      message.error("Không thể lấy thông tin người dùng");
      return {} as User;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as User;
  }
};
