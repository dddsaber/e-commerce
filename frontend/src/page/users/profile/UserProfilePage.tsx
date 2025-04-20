import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  UploadFile,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import dayjs from "dayjs";
import { updateUser } from "../../../api/user.api";
import UploadAvatar from "../../../components/shared/UploadAvatar";
import { TYPE_IMAGE } from "../../../utils/constant";
import { reloginAuth } from "../../../redux/slices/authSlice";

const UserProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const url = user?.avatar;
    if (url) setImageUrl(url);
    else setImageUrl("");
  }, [form, user]);
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
      setLoading(true);
      if (!user) {
        message.error("Bạn phải đăng nhập để cập nhật hồ sơ!");
        return;
      }
      const values = await form.validateFields();
      if (imageUrl) {
        values.avatar = imageUrl;
        setImageUrl("");
      }
      const updated_user = await updateUser({ _id: user._id, ...values });

      if (updated_user) {
        message.success(`Cập nhật hồ sơ thành công!`);
      }

      setLoading(false);
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        dispatch(reloginAuth({ refreshToken }));
      }
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  return (
    <Card
      title="Cập nhật hồ sơ"
      styles={{
        title: {
          textAlign: "center",
        },
      }}
    >
      <Row justify="center" style={{ marginBottom: 20 }}>
        <Col>
          <div style={{ textAlign: "center" }}>
            <UploadAvatar
              fileList={fileList}
              setFileList={setFileList}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              loading={loading}
              key={"upload_product_file"}
              typeFile={TYPE_IMAGE.user}
            />
          </div>
        </Col>
      </Row>

      <Form
        form={form}
        labelCol={{ xs: { span: 24 }, md: { span: 6 } }}
        wrapperCol={{ xs: { span: 24 }, md: { span: 14 } }}
        layout="horizontal"
      >
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
        <Form.Item
          wrapperCol={{
            xs: { span: 24 },
            md: { span: 14, offset: 6 },
          }}
          style={{ textAlign: "center" }}
        >
          <Button
            type="primary"
            onClick={updateProfile}
            loading={loading}
            style={{ minWidth: 120 }}
          >
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserProfilePage;
