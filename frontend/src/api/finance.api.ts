import { instance } from ".";
import { Finance } from "../type/finance.type";
const URL = "/finance";

export const getFinanceByUserId = async (userId: string): Promise<Finance> => {
  const response = await instance.get<Finance>(`${URL}/get-finance/${userId}`);
  return response.data;
};

export const createCoupon = async (body: {
  userId: string;
  bankAccountNumber: string;
  bankName: string;
  accountHolder: string;
}): Promise<Finance> => {
  const response = await instance.post<Finance>(`${URL}/create-finance`, body);
  return response.data;
};

export const updateCoupon = async (
  id: string,
  body: Finance
): Promise<Finance> => {
  const response = await instance.put<Finance>(
    `${URL}/update-finance/${id}`,
    body
  );
  return response.data;
};
