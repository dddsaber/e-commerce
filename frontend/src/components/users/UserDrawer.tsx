import React, { useEffect, useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Switch,
  UploadFile,
  message,
} from "antd";
import { User } from "../../type/user.type";
import { createUser, updateUser } from "../../api/user.api";
import { TYPE_IMAGE } from "../../utils/constant";
import UploadImage from "../shared/UploadImage";

interface UserDrawerProps {
  visible: boolean;
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setSelectedUser: (value: User | undefined) => void;
  onClose: () => void;
  selectedUser?: User;
}

const UserDrawer: React.FC<UserDrawerProps> = ({
  visible,
  reload,
  setReload,
  loading,
  setSelectedUser,
  onClose,
  selectedUser = undefined,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const url = selectedUser?.avatar;
    if (url) setImageUrl(url);
    else setImageUrl("");
  }, [form, selectedUser]);

  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (imageUrl) {
          values.avatar = imageUrl;
          setImageUrl("");
        }
        console.log(values);
        if (selectedUser) {
          const result = await updateUser({
            ...values,
            _id: selectedUser._id,
          });
          if (result) {
            message.success("Cập nhật tài khoản thành công");
          }
        } else {
          const result = await createUser(values);
          if (result) {
            message.success("Thêm tài khoản thành công");
          }
        }
      })
      .catch((info) => {
        message.error("Validate Failed:", info);
      })
      .finally(() => {
        form.resetFields();
        onClose();
        setSelectedUser(undefined);
        setReload(!reload);
      });
  };

  return (
    <Drawer
      title={
        selectedUser?.username ? "Chỉnh sửa người dùng" : "Thêm người dùng"
      }
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
      {/* Avatar */}
      <UploadImage
        fileList={fileList}
        setFileList={setFileList}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        loading={loading}
        key={"upload_product_file"}
        typeFile={TYPE_IMAGE.user}
      />
      <Form
        form={form}
        layout="vertical"
        initialValues={selectedUser ?? { role: "user", isActive: true }}
        onFinish={handleSubmit}
        clearOnDestroy
      >
        {/* Tên đăng nhập */}
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
        >
          <Input placeholder="Nhập tên đăng nhập" />
        </Form.Item>

        {/* Password */}
        <Form.Item name="password" label="Mật khẩu">
          <Input type="password" />
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

        {/* Giới tính */}
        <Form.Item name="gender" label="Giới tính">
          <Select>
            <Select.Option value={true}>Nam</Select.Option>
            <Select.Option value={false}>Nữ</Select.Option>
          </Select>
        </Form.Item>

        {/* Ngày sinh */}
        <Form.Item name="birthday" label="Ngày sinh">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* Vai trò */}
        <Form.Item name="role" label="Vai trò">
          <Select>
            <Select.Option value="user">Người dùng</Select.Option>
            <Select.Option value="shipper">Shipper</Select.Option>
            <Select.Option value="admin">Quản trị viên</Select.Option>
            <Select.Option value="sales">Nhân viên bán hàng</Select.Option>
          </Select>
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

        {/* Trạng thái hoạt động */}
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Bị khóa" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default UserDrawer;
