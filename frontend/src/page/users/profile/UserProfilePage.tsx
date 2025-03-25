import { Button, Card, DatePicker, Form, Input, message, Select } from "antd";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import dayjs from "dayjs";
import { updateUser } from "../../../api/user.api";

const UserProfilePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [form] = Form.useForm();

  // Khi user thay đổi, cập nhật giá trị form
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username || "",
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        description: user.description || "",
        birthday: user.birthday ? dayjs(user.birthday) : null,
        gender: user.gender || undefined,
      });
    }
  }, [user, form]);

  const updateProfile = async () => {
    try {
      if (!user) {
        message.error("Bạn phải đăng nhập để cập nhật hồ sơ!");
        return;
      }
      const values = await form.validateFields();
      const updated_user = await updateUser({ _id: user._id, ...values });

      if (updated_user) {
        message.success(`Cập nhật hồ sơ thành công!`);
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  return (
    <Card
      title="Cập nhật hồ sơ"
      styles={{
        title: { textAlign: "center" },
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
        {/* Tên đăng nhập */}
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
        >
          <Input />
        </Form.Item>

        {/* Họ và tên */}
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input />
        </Form.Item>

        {/* Số điện thoại */}
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input />
        </Form.Item>

        {/* Ngày sinh */}
        <Form.Item name="birthday" label="Ngày sinh">
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        {/* Giới tính */}
        <Form.Item name="gender" label="Giới tính">
          <Select placeholder="Chọn giới tính">
            <Select.Option value={true}>Nam</Select.Option>
            <Select.Option value={false}>Nữ</Select.Option>
            <Select.Option value="other">Khác</Select.Option>
          </Select>
        </Form.Item>

        {/* Mô tả */}
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* Nút lưu */}
        <Form.Item style={{ textAlign: "center", alignItems: "center" }}>
          <Button type="primary" onClick={updateProfile}>
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserProfilePage;
