import { AxiosResponse } from "axios";
import { instance } from ".";
import { authUser } from "../type/user.type";
import { handleApiError } from "../utils/handle_error_func";
const URL = "/auth";

export const register = async (body: {
  phone: string;
  password: string;
}): Promise<AxiosResponse<authUser>> => {
  try {
    const response = await instance.post<authUser>(`${URL}/register`, body);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
};

export const login = async (body: {
  identifier: string;
  password: string;
}): Promise<AxiosResponse<authUser>> => {
  try {
    const response = await instance.post<authUser>(`${URL}/login`, body);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
};

export const reAuth = async (body: {
  refreshToken: string;
}): Promise<AxiosResponse<authUser>> => {
  try {
    const response = await instance.post<authUser>(`${URL}/reauth`, body);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
};

export const logout = async (id: string) => {
  try {
    const response = await instance.get(`${URL}/logout/${id}`);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
    return;
  }
};

export const loginGoogle = async (
  token: string
): Promise<AxiosResponse<authUser>> => {
  try {
    const response = await instance.post<authUser>(`${URL}/login-google`, {
      token,
    });
    return response;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
};

export const loginFacebook = async (): Promise<AxiosResponse<authUser>> => {
  try {
    const response = await instance.get<authUser>(`${URL}/facebook`);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
};

export const loginGithub = async (): Promise<AxiosResponse<authUser>> => {
  try {
    const response = await instance.get<authUser>(`${URL}/github`);
    return response;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
};
