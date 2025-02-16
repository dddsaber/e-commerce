import { LockOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth.api";
import bg from "../../assets/bookbg.jpg";

const ResetPasswordPage = () => {
  const { userId } = useParams(); // Lấy userId từ URL
  const location = useLocation(); // Lấy thông tin của URL
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const requestData = {
      ...values,
      token: token,
      userId: userId,
    };
    const response = await resetPassword(requestData);
    if (response.status) {
      alert(`Reset Password Successfully! Please log in to your account`);
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    // Sử dụng URLSearchParams để lấy token từ query string
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location.search]);
  console.log(userId, token);
  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: "100%",
        height: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        style={{
          width: "450px",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: "20px",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Reset Password
        </Typography.Title>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Nhập password!",
            },
            {
              min: 8,
              message: "Password phải lớn hơn 8 ký tự!",
            },
          ]}
          hasFeedback
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Nhập xác nhận password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Password chưa khớp!"));
              },
            }),
          ]}
        >
          <Input.Password
            type="password"
            placeholder="Password"
            prefix={<LockOutlined className="site-form-item-icon" />}
            size="large"
          />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="login-form-button"
            style={{ marginBottom: 10 }}
            block
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default ResetPasswordPage;
