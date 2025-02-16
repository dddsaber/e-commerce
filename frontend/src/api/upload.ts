import { instance } from ".";

const baseURL = "file";

export const uploadFile = (file: File, type: string) => {
  return instance.post(
    `${baseURL}/upload/${type}`,
    {
      file,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const uploadFiles = (files: File[], type: string) => {
  if (files.length === 1) {
    return uploadFile(files[0], type);
  }
  return instance.post(
    `${baseURL}/uploads/${type}`,
    {
      files,
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
