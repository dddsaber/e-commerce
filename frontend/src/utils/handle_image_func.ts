import { baseURL, TYPE_IMAGE } from "./constant";
import { message } from "antd";
import type { GetProp, UploadProps } from "antd";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

export const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};
export const getSourceImage = (url: string): string => {
  if (!url) return "/images/default.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith(TYPE_IMAGE.product)) {
    url = `products/${url}`;
  } else if (url.startsWith(TYPE_IMAGE.user)) {
    url = `users/${url}`;
  } else if (url.startsWith(TYPE_IMAGE.review)) {
    url = `reviews/${url}`;
  } else if (url.startsWith(TYPE_IMAGE.store)) {
    url = `stores/${url}`;
  }
  return `${baseURL}/uploads/${url}`;
};
