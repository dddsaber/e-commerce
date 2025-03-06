import {
  GetProp,
  message,
  notification,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import React from "react";
import { uploadFiles } from "../../api/upload";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { getSourceImage } from "../../utils/handle_image_func";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
interface UploadImageProps {
  loading: boolean;
  setFileList: (value: UploadFile[]) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  fileList: UploadFile[];
  typeFile: string;
}

const UploadImage: React.FC<UploadImageProps> = ({
  loading,
  setFileList,
  imageUrl,
  setImageUrl,
  fileList,
  typeFile,
}) => {
  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  const props = {
    multiple: false,
    onRemove: (file: UploadFile) => {
      const index = fileList.indexOf(file);
      const newFileList = [...fileList]; // Sử dụng spread operator để copy mảng
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: async (file: FileType) => {
      try {
        // Kiểm tra loại file (chỉ cho phép ảnh PNG)
        const notShowError = file.type?.includes("image");
        if (!notShowError) {
          message.error(`${file.name} is not a png file`);
          return false; // Trả về false để không upload file nếu lỗi
        }

        // Kiểm tra kích thước file (chỉ cho phép dưới 2MB)
        const isLt2M = file.size! / 1024 / 1024 < 2; // Sử dụng `!` để chỉ định chắc chắn `file.size` có giá trị
        if (!isLt2M) {
          notification.error({
            message: "Kích thước ảnh phải nhỏ hơn 2MB",
          });
          return false;
        }
        // Upload file và lấy URL ảnh
        let image = imageUrl;
        const response = await uploadFiles([file], typeFile);
        const { fileURLs } = response.data; // Lấy fileURLs từ phản hồi API
        image = fileURLs[0]; // Lấy URL của ảnh sau khi upload
        console.log(image);
        setImageUrl(image);

        return false; // Không tiếp tục upload file tự động sau khi xử lý
      } catch (error) {
        console.log("====================================");
        console.log("error", error);
        console.log("====================================");
        return false; // Trả về false nếu có lỗi
      }
    },
  };

  return (
    <>
      <Upload
        name="photo"
        listType="picture-card"
        showUploadList={false}
        className="image-uploader"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleChange}
        {...props}
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {imageUrl ? (
          <img
            src={getSourceImage(imageUrl)}
            alt="image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
    </>
  );
};

export default UploadImage;
