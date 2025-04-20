import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Flex, Form, Input, Typography, Grid } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { registerAuth } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";

// Định nghĩa kiểu cho RegisterInfo
interface RegisterInfo {
  name: string;
  phone: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { xs, sm, md } = Grid.useBreakpoint();

  // Hàm xử lý form submit
  const onFinish = async (values: RegisterInfo) => {
    values.phone = values.phone.trim();
    values.password = values.password.trim();

    try {
      const { user } = await dispatch(registerAuth(values)).unwrap();
      if (!user) {
        alert("Register failed");
        return;
      }
      alert("Register successful");
      navigate("/");
    } catch (error) {
      alert("Register failed");
      console.error("Register error:", error);
    }
  };

  const formWidth = xs ? "100%" : sm ? "90%" : md ? "500px" : "600px";

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: 16,
      }}
    >
      <Form
        name="register"
        className="register-form"
        onFinish={onFinish}
        style={{
          width: formWidth,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: "24px",
          backgroundColor: "#ffffff",
        }}
        layout="vertical"
      >
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Register
        </Typography.Title>

        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Full name must be provided!" }]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="Enter Your Full Name"
          />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Phone must be provided!" },
            {
              message: "Invalid phone number format",
              pattern: /^[0-9]{1,3}\s?[0-9]{1,15}$/,
            },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="Enter Your Phone Number"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: "Password must be provided!" },
            { min: 8, message: "Password must be at least 8 characters long!" },
          ]}
          hasFeedback
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Confirm Password must be provided!" },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                value === getFieldValue("password")
                  ? Promise.resolve()
                  : Promise.reject("Passwords do not match!"),
            }),
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject("You must accept the agreement"),
            },
          ]}
        >
          <Checkbox>
            Tôi đã đọc và đồng ý <Link to="#">điều khoản sử dụng</Link>
          </Checkbox>
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            style={{ marginBottom: 10, backgroundColor: "black" }}
          >
            Đăng ký
          </Button>
          <Flex justify="space-between" wrap="wrap" gap={8}>
            <Link to="/login">Đã có tài khoản?</Link>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </Flex>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default RegisterPage;
