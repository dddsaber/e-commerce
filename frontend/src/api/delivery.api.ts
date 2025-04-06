import { instance } from ".";
import { Delivery, GetDeliveryRequest } from "../type/order.type";
import { Address } from "../type/user.type";
const URL = "/delivery";

export const getDeliveryDetails = async (
  user_address: Address,
  store_address: Address
): Promise<{
  distance: number;
  shippingFee: number;
  estimatedDate: string;
}> => {
  const response = await instance.post<{
    distance: number;
    shippingFee: number;
    estimatedDate: string;
  }>(`${URL}/get-info`, {
    user_address,
    store_address,
  });
  return response.data;
};

export const updateTimeStamp = async (
  deliveryId: string,
  warehouseId: string
): Promise<Delivery> => {
  const response = await instance.put<Delivery>(
    `${URL}/update-timestamp/${deliveryId}/${warehouseId}`
  );
  return response.data;
};

export const getDeliveries = async (
  params: GetDeliveryRequest
): Promise<{ deliveries: Delivery[]; totalDeliveries: number }> => {
  const response = await instance.post<{
    deliveries: Delivery[];
    totalDeliveries: number;
  }>(`${URL}/get-deliveries`, params);
  return response.data;
};
