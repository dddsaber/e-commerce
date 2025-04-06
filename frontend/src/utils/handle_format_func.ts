import dayjs from "dayjs";
import { Address } from "../type/store.type";

export function formatDate(dateString: Date) {
  const date = new Date(dateString);

  // Lấy giờ, phút, giây
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Lấy ngày, tháng, năm
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();

  // Trả về định dạng hh:mm:ss dd-mm-yyyy
  return `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
}

export function formatRate(num: number) {
  return Math.round(num * 100) / 100;
}

export const FORMAT_DATE = "DD/MM/YYYY";
export const FORMAT_DATE_MONGO = "YYYY-MM-DD";
export const FORMAT_DATE_MONGO_ISO = "YYYY-MM-DDTHH:mm:ssZ";
export const FORMAT_DATE_TIME = "DD/MM/YYYY HH:mm";
export const FORMAT_TIME = "HH:mm";
export const FORMAT_FULL_TIME = "HH:mm:ss";
export const baseURL = "http://localhost:5000";
export const baseUrlSocket = "http://localhost:3000";

export const getToday = () => {
  return dayjs().format(FORMAT_DATE);
};

export const formatedDate = (
  date: string | Date,
  format = FORMAT_DATE,
  formatStr = FORMAT_DATE
) => {
  return dayjs(date, format).format(formatStr);
};

export const formatedTime = (
  date: string | Date,
  format = FORMAT_TIME,
  formatTime = FORMAT_TIME
) => {
  return dayjs(date, format).format(formatTime);
};

export const formatAddress = (address?: Address) => {
  if (!address) return "";
  return `${address.ward || ""}, ${address.details || ""}, ${
    address.district || ""
  }, ${address.province || ""}`;
};
