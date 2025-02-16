import { notification } from "antd";
import axios from "axios";
import { baseURL } from "../utils/constant";

export const instance = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    notification.error({
      message: error.response.data.message,
    });
    return Promise.reject(error.response.data);
  }
);

export const imgInstance = axios.create({
  baseURL: `${baseURL}/upload`,
  headers: {
    Accept: "application/json",
  },
});

imgInstance.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

imgInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    notification.error({
      message: error.response.data.message,
    });
    return Promise.reject(error.response.data);
  }
);
