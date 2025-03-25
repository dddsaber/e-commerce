import React from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Space, Typography } from "antd";
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

  // Hàm xử lý form submit
  const onFinish = async (values: RegisterInfo) => {
    // Loại bỏ khoảng trắng thừa ở đầu và cuối
    values.phone = values.phone.trim();
    values.password = values.password.trim();

    // Gọi action registerAuth và xử lý kết quả
    const { user } = await dispatch(registerAuth(values)).unwrap();
    if (!user) {
      alert("Register failed");
      return;
    }
    alert("Register successful");
    navigate("/");
  };

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Form
          name="register"
          className="register-form"
          onFinish={onFinish}
          style={{
            width: "450px",
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: "20px",
            backgroundColor: "#ffffff",
            margin: "auto",
            marginTop: "100px",
          }}
        >
          <Typography.Title level={3} style={{ textAlign: "center" }}>
            Register
          </Typography.Title>
          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Full name must be provided!",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="site-form-item-icons" />}
              placeholder="Enter Your Full Name"
            />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[
              {
                required: true,
                message: "Phone must be provided!",
              },
              {
                message: "Invalid phone number format",
                pattern: /^[0-9]{1,3}\s?[0-9]{1,15}$/,
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="site-form-item-icons" />}
              placeholder="Enter Your Phone Number"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Password must be provided!",
              },
              {
                min: 8,
                message: "Password must be at least 8 characters long!",
              },
            ]}
            hasFeedback
          >
            <Input
              size="large"
              prefix={<LockOutlined className="site-form-item-icons" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              {
                required: true,
                message: "Confirm Password must be provided!",
              },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  value === getFieldValue("password")
                    ? Promise.resolve()
                    : Promise.reject("Passwords do not match!"),
              }),
            ]}
          >
            <Input
              size="large"
              prefix={<LockOutlined className="site-form-item-icons" />}
              type="password"
              placeholder="Confirm Password"
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="agreement" valuePropName="checked">
              <Checkbox>
                I have read and agree to the terms and conditions
              </Checkbox>
            </Form.Item>
          </Form.Item>
          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{ marginBottom: 10 }}
              className="login-form-button"
            >
              Register
            </Button>
            <Space>
              <Link to="/login">Already have an account?</Link>
            </Space>
            <Space>&nbsp;</Space>
            <Space>
              <Link to="/forgot-password">Forgot password?</Link>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;
