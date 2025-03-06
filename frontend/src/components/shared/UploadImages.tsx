import {
  Col,
  GetProp,
  Image,
  message,
  notification,
  Row,
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
  imageUrls: string[];
  setImageUrls: (value: string[]) => void;
  fileList: UploadFile[];
  typeFile: string;
}

const UploadImages: React.FC<UploadImageProps> = ({
  loading,
  setFileList,
  imageUrls,
  setImageUrls,
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
    multiple: true,
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

        const response = await uploadFiles([file], typeFile);
        const { fileURLs } = response.data; // Lấy fileURLs từ phản hồi API
        const img: string = fileURLs[0];
        setImageUrls([...imageUrls, img]);

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
      <Row gutter={[16, 16]}>
        {imageUrls.map((imageUrl, index) => (
          <Col span={4} key={index}>
            <Image
              src={getSourceImage(imageUrl)}
              alt={`image-${index}`}
              style={{
                width: "100%",
                height: "auto", // Giữ tỉ lệ ảnh
                objectFit: "cover",
                borderRadius: "8px", // Optional: để làm mềm các cạnh
              }}
            />
          </Col>
        ))}
        <Col span={4}>
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
            {" "}
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
        </Col>
      </Row>
    </>
  );
};

export default UploadImages;
