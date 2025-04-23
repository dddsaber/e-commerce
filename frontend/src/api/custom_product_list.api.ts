import { instance } from ".";
import {
  CustomProductList,
  CustomProductListInput,
} from "../type/custom_product_list.type";
const URL = "/custom-product-list";

export const createCustomProductList = async (
  body: CustomProductListInput
): Promise<CustomProductList> => {
  const response = await instance.post<CustomProductList>(
    `${URL}/create-custom-product-list`,
    body
  );
  return response.data;
};

export const getCustomProductList = async (
  storeId: string
): Promise<CustomProductList[]> => {
  const response = await instance.get<CustomProductList[]>(
    `${URL}/get-custom-product-list/${storeId}`
  );
  return response.data;
};

export const updateCustomProductListOrder = async (
  storeId: string,
  listIds: string[]
) => {
  const response = await instance.put(
    `${URL}/update-custom-product-list-order`,
    {
      storeId,
      listIds,
    }
  );
  return response.data;
};

export const updateCustomProductListStatus = async (
  id: string,
  status: boolean
): Promise<CustomProductList> => {
  const response = await instance.put<CustomProductList>(
    `${URL}/update-custom-product-list-status/${id}`,
    { status }
  );
  return response.data;
};

export const updateCustomProductList = async (
  id: string,
  body: CustomProductList
): Promise<CustomProductList> => {
  const response = await instance.put<CustomProductList>(
    `${URL}/update-custom-product-list-info/${id}`,
    body
  );
  return response.data;
};

export const deleteCustomProductList = async (id: string) => {
  const response = await instance.delete(`${URL}/delete/${id}`);
  return response.data;
};
