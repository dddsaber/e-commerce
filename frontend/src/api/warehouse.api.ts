import { instance } from ".";
import { GetWarehousesRequest, Warehouse } from "../type/warehouse.type";
const URL = "/warehouse";

export const getReports = async (
  params: GetWarehousesRequest
): Promise<{ warehouses: Warehouse[]; totalWarehouses: number }> => {
  const response = await instance.post<{
    warehouses: Warehouse[];
    totalWarehouses: number;
  }>(`${URL}/get-warehouses`, params);

  return response.data;
};

export const createWarehouse = async (body: Warehouse): Promise<Warehouse> => {
  const response = await instance.post<Warehouse>(
    `${URL}/create-warehouse`,
    body
  );
  return response.data;
};

export const updateWarehouse = async (
  id: string,
  body: Warehouse
): Promise<Warehouse> => {
  const response = await instance.put<Warehouse>(
    `${URL}/update-warehouse/${id}`,
    body
  );
  return response.data;
};

export const updateWarehouseStatus = async (
  id: string,
  status: boolean
): Promise<Warehouse> => {
  const response = await instance.put<Warehouse>(
    `${URL}/update-warehouse-status/${id}`,
    { status }
  );
  return response.data;
};

export const getWarehouseById = async (id: string): Promise<Warehouse> => {
  const response = await instance.get<Warehouse>(`${URL}/get-by-id/${id}`);
  return response.data;
};

export const getWarehouseByUserId = async (
  userId: string
): Promise<Warehouse> => {
  const response = await instance.get<Warehouse>(
    `${URL}/get-warehouse-by-user/${userId}`
  );
  return response.data;
};
