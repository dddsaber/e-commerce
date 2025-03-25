import React, { useEffect, useState } from "react";
import { Store } from "../../type/store.type";
import {
  Button,
  Drawer,
  Form,
  GetProp,
  Input,
  message,
  notification,
  Switch,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { createStore, updateStoreInformation } from "../../api/store.api";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { uploadFiles } from "../../api/upload";
import { getSourceImage } from "../../utils/handle_image_func";
import { TYPE_IMAGE } from "../../utils/constant";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface StoreDrawerProps {
  visible: boolean;
  reload: boolean;
  loading: boolean;
  setReload: (value: boolean) => void;
  setselectedStore: (value: Store | undefined) => void;
  onClose: () => void;
  selectedStore?: Store;
}
const StoreDrawer: React.FC<StoreDrawerProps> = ({
  visible,
  reload,
  loading,
  setReload,
  setselectedStore,
  onClose,
  selectedStore,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const url = selectedStore?.logo;
    if (url) setImageUrl(url);
    else setImageUrl("");
  }, [form, selectedStore]);

  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (imageUrl) {
          values.logo = imageUrl;
          setImageUrl("");
        }
        if (selectedStore) {
          const result = await updateStoreInformation({
            _id: selectedStore._id,
            statistics: selectedStore.statistics,
            ...values,
          });
          if (result) {
            message.success("Cập nhật thông tin thành công!");
          } else {
            const result = await createStore(values);
            if (result) {
              message.success("Thêm mới thành công!");
            }
          }
          form.resetFields();
          onClose();
          setselectedStore(undefined);
          setReload(!reload);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

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
        let logo = imageUrl;
        const response = await uploadFiles([file], TYPE_IMAGE.store);
        const { fileURLs } = response.data; // Lấy fileURLs từ phản hồi API
        logo = fileURLs[0]; // Lấy URL của ảnh sau khi upload
        console.log(logo);
        setImageUrl(logo);

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
    <Drawer
      title={selectedStore?.name ? "Chỉnh sửa cửa hàng" : "Thêm cửa hàng"}
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" onClick={() => form.submit()}>
            Lưu
          </Button>
        </div>
      }
    >
      <Upload
        name="logo"
        listType="picture-circle"
        showUploadList={false}
        className="avatar-uploader"
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
            alt="logo"
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
      <Form
        form={form}
        layout="vertical"
        initialValues={selectedStore ?? { role: "user", isActive: true }}
        onFinish={handleSubmit}
        clearOnDestroy
      >
        {/* Tên đăng nhập */}
        <Form.Item
          name="userId"
          label="Mã người dùng"
          rules={[{ required: true, message: "Vui lòng nhập mã người dùng!" }]}
        >
          <Input placeholder="Nhập mã người dùng" />
        </Form.Item>

        {/* Tên đăng nhập */}
        <Form.Item
          name="name"
          label="Tên cửa hàng"
          rules={[{ required: true, message: "Vui lòng nhập tên cửa hàng!" }]}
        >
          <Input placeholder="Nhập tên cửa hàng" />
        </Form.Item>

        {/* Họ tên */}
        <Form.Item name="name" label="Họ tên">
          <Input placeholder="Nhập họ tên" />
        </Form.Item>

        {/* Email */}
        <Form.Item name="email" label="Email">
          <Input type="email" placeholder="Nhập email" />
        </Form.Item>

        {/* Số điện thoại */}
        <Form.Item name="phone" label="Số điện thoại">
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        {/* Địa chỉ */}
        <Form.Item name={["address", "province"]} label="Tỉnh/Thành phố">
          <Input placeholder="Nhập tỉnh/thành phố" />
        </Form.Item>
        <Form.Item name={["address", "district"]} label="Quận/Huyện">
          <Input placeholder="Nhập quận/huyện" />
        </Form.Item>
        <Form.Item name={["address", "ward"]} label="Phường/Xã">
          <Input placeholder="Nhập phường/xã" />
        </Form.Item>
        <Form.Item name={["address", "details"]} label="Địa chỉ cụ thể">
          <Input placeholder="Nhập địa chỉ cụ thể" />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item name="description" label="Mô tả">
          <Input placeholder="Mô tả" />
        </Form.Item>

        {/* Trạng thái hoạt động */}
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Bị khóa" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default StoreDrawer;
