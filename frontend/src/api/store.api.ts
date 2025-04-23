import { instance } from "."; // Giả sử instance đã được cấu hình trước đó
import { GetPayoutsRequest, Payout } from "../type/payout.type";
import {
  Store,
  GetStoresRequest,
  TaxInformation,
  Address,
} from "../type/store.type";

const URL = "/store";

// 🟢 Lấy danh sách các store
export const getStores = async (
  params: GetStoresRequest
): Promise<{ stores: Store[]; totalStores: number }> => {
  const response = await instance.post<{
    stores: Store[];
    totalStores: number;
  }>(`${URL}/get-stores`, params);
  return response.data;
};

// 🟢 Tạo mới store
export const createStore = async (body: Store): Promise<Store> => {
  const response = await instance.post<Store>(`${URL}/create`, body);

  return response.data;
};

// 🟢 Tạo mới store
export const storeInfoRegistration = async (body: Store): Promise<Store> => {
  const response = await instance.post<Store>(
    `${URL}/registration-store-info`,
    body
  );

  return response.data;
};

// 🟢 Tạo mới store
export const storeTaxRegistration = async (
  storeId: string,
  body: TaxInformation
): Promise<Store> => {
  const response = await instance.post<Store>(
    `${URL}/${storeId}/registration-store-tax`,
    body
  );
  return response.data;
};

// 🟢 Tạo mới store
export const storeIdentityRegistration = async (
  storeId: string,
  userId: string,
  body: Store
): Promise<Store> => {
  const response = await instance.post<Store>(
    `${URL}/${storeId}/${userId}/registration-store-identity`,
    body
  );
  return response.data;
};

// 🟢 Cập nhật thông tin store
export const updateStoreInformation = async (
  body: Partial<Store>
): Promise<Store> => {
  const response = await instance.put<Store>(
    `${URL}/${body._id}/update-info`,
    body
  );

  return response.data;
};

// 🟢 Cập nhật trạng thái store (hoạt động / không hoạt động)
export const updateStoreStatus = async (
  id: string,
  status: boolean
): Promise<Store> => {
  const response = await instance.put<Store>(
    `${URL}/${id}/update-store-status`,
    {
      status,
    }
  );
  return response.data;
};

// 🟢 Cập nhật dia chi store
export const updateStoreAddress = async (
  id: string,
  address: Address
): Promise<Store> => {
  const response = await instance.put<Store>(`${URL}/${id}/update-address`, {
    address,
  });
  return response.data;
};

// 🟢 Lấy thông tin store theo ID
export const getStoreById = async (id: string): Promise<Store> => {
  const response = await instance.get<Store>(`${URL}/${id}`);

  return response.data;
};

// 🟢 Lấy thông tin store theo userId
export const getStoreByUserId = async (userId: string): Promise<Store> => {
  const response = await instance.get<Store>(`${URL}/user/${userId}`);

  return response.data;
};

// Follow store
export const followStore = async (
  storeId: string,
  userId: string,
  isFollowed: boolean
) => {
  const response = await instance.post(`${URL}/follow/update-follow`, {
    storeId,
    userId,
    isFollowed,
  });
  return response.data;
};

// Follow store
export const checkFollow = async (storeId: string, userId: string) => {
  const response = await instance.get(`${URL}/follow/${storeId}/${userId}`);
  return response.data;
};

export const getInfo = async (
  storeId: string
): Promise<{ totalProducts: number; totalFollowed: number }> => {
  const response = await instance.get<{
    totalProducts: number;
    totalFollowed: number;
  }>(`${URL}/${storeId}/store-info`);
  return response.data;
};

export const createPayout = async (storeId: string) => {
  const response = await instance.get(`${URL}/${storeId}/create-payout`);
  return response.data;
};

export const getPayouts = async (
  params: GetPayoutsRequest
): Promise<{ payouts: Payout[]; totalPayouts: number }> => {
  const response = await instance.post<{
    payouts: Payout[];
    totalPayouts: number;
  }>(`${URL}/get-payouts`, params);
  return response.data;
};
