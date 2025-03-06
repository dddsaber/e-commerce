import { instance } from "."; // Giả sử instance đã được cấu hình trước đó
import { Store, GetStoresRequest, TaxInformation } from "../type/store.type"; // Định nghĩa kiểu dữ liệu Store và GetStoresRequest
import { handleApiError } from "../utils/handle_error_func";

const URL = "/store";

// 🟢 Lấy danh sách các store
export const getStores = async (
  params: GetStoresRequest
): Promise<{ stores: Store[]; totalStores: number }> => {
  try {
    const response = await instance.post<{
      stores: Store[];
      totalStores: number;
    }>(`${URL}/get-stores`, params);
    if (response.status) {
      // Kiểm tra nếu response thành công
      return response.data;
    } else {
      handleApiError(new Error("Không thể lấy danh sách store"));
      return { stores: [], totalStores: 0 };
    }
  } catch (error: unknown) {
    handleApiError(error);
    return { stores: [], totalStores: 0 };
  }
};

// 🟢 Tạo mới store
export const createStore = async (body: Store): Promise<Store> => {
  try {
    const response = await instance.post<Store>(`${URL}/create`, body);
    if (response.status) {
      // Kiểm tra nếu response thành công
      return response.data;
    } else {
      handleApiError(new Error("Không thể tạo store"));
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};

// 🟢 Tạo mới store
export const storeInfoRegistration = async (body: Store): Promise<Store> => {
  try {
    const response = await instance.post<Store>(
      `${URL}/registration-store-info`,
      body
    );
    if (response.status) {
      // Kiểm tra nếu response thành công
      return response.data;
    } else {
      handleApiError(new Error("Không thể tạo store"));
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};

// 🟢 Tạo mới store
export const storeTaxRegistration = async (
  storeId: string,
  body: TaxInformation
): Promise<Store> => {
  try {
    const response = await instance.post<Store>(
      `${URL}/${storeId}/registration-store-tax`,
      body
    );
    if (response.status) {
      // Kiểm tra nếu response thành công
      return response.data;
    } else {
      handleApiError(new Error("Không thể tạo store"));
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};

// 🟢 Tạo mới store
export const storeIdentityRegistration = async (
  storeId: string,
  userId: string,
  body: Store
): Promise<Store> => {
  try {
    const response = await instance.post<Store>(
      `${URL}/${storeId}/${userId}/registration-store-identity`,
      body
    );
    if (response.status) {
      // Kiểm tra nếu response thành công
      return response.data;
    } else {
      handleApiError(new Error("Không thể tạo store"));
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};

// 🟢 Cập nhật thông tin store
export const updateStoreInformation = async (
  body: Partial<Store>
): Promise<Store> => {
  try {
    const response = await instance.put<Store>(
      `${URL}/${body._id}/update-info`,
      body
    );
    if (response.status) {
      // Kiểm tra nếu response thành công
      return response.data;
    } else {
      handleApiError(new Error("Không thể cập nhật thông tin store"));
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};

// 🟢 Cập nhật trạng thái store (hoạt động / không hoạt động)
export const updateStoreStatus = async (
  id: string,
  status: boolean
): Promise<Store> => {
  try {
    const response = await instance.put<Store>(
      `${URL}/${id}/update-store-status`,
      {
        status,
      }
    );
    if (response.status) {
      // Kiểm tra nếu response thành công
      return response.data;
    } else {
      handleApiError(new Error("Không thể cập nhật trạng thái store"));
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};

// 🟢 Lấy thông tin store theo ID
export const getStoreById = async (id: string): Promise<Store> => {
  try {
    const response = await instance.get<Store>(`${URL}/${id}`);
    if (response.status) {
      // Kiểm tra nếu response thành công

      return response.data;
    } else {
      handleApiError(new Error("Không thể lấy thông tin store"));
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};

// 🟢 Lấy thông tin store theo userId
export const getStoreByUserId = async (userId: string): Promise<Store> => {
  try {
    const response = await instance.get<Store>(`${URL}/user/${userId}`);
    if (response.status && response.data) {
      // Kiểm tra nếu response thành công

      return response.data;
    } else {
      return {} as Store;
    }
  } catch (error: unknown) {
    handleApiError(error);
    return {} as Store;
  }
};
