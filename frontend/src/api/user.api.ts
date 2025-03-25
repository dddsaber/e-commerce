import { instance } from ".";
import { Address, GetUsersRequest, User } from "../type/user.type";

const URL = "/user";

// 🟢 Lấy danh sách người dùng
export const getUsers = async (
  params: GetUsersRequest
): Promise<{ users: User[]; totalUsers: number }> => {
  const response = await instance.post<{ users: User[]; totalUsers: number }>(
    `${URL}/get-users`,
    params
  );

  return response.data;
};

// 🟢 Tạo mới người dùng
export const createUser = async (body: User): Promise<User> => {
  const response = await instance.post<User>(`${URL}/create-user`, body);

  return response.data;
};

// 🟢 Cập nhật thông tin người dùng
export const updateUser = async (body: Partial<User>): Promise<User> => {
  const response = await instance.put<User>(
    `${URL}/${body._id}/update-user`,
    body
  );

  return response.data;
};

// 🟢 Cập nhật trạng thái người dùng
export const updateUserStatus = async (
  id: string,
  status: boolean
): Promise<User> => {
  const response = await instance.put<User>(`${URL}/${id}/update-user-status`, {
    status,
  });

  return response.data;
};

export const updateUserAddress = async (
  id: string,
  address: Address
): Promise<User> => {
  const response = await instance.put<User>(
    `${URL}/${id}/update-user-address`,
    {
      address,
    }
  );

  return response.data;
};

export const updateUserPassword = async (
  id: string,
  oldPassword: string,
  newPassword: string
): Promise<User> => {
  const response = await instance.put<User>(
    `${URL}/${id}/update-user-password`,
    {
      oldPassword,
      newPassword,
    }
  );

  return response.data;
};

// 🟢 Lấy thông tin người dùng theo ID
export const getUserById = async (id: string): Promise<User> => {
  const response = await instance.get<User>(`${URL}/${id}`);

  return response.data;
};
