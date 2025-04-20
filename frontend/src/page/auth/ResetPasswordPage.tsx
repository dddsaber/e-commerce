import { LockOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Typography, Grid } from "antd";
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth.api";
import bg from "../../assets/bookbg.jpg";

const ResetPasswordPage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { xs, sm, md } = Grid.useBreakpoint();

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location.search]);

  const onFinish = async (values: { password: string; confirm: string }) => {
    const requestData = {
      ...values,
      token,
      userId,
    };
    const response = await resetPassword(requestData);
    if (response.status) {
      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate("/login", { replace: true });
    } else {
      alert("Đổi mật khẩu thất bại. Vui lòng thử lại!");
    }
  };

  const formWidth = xs ? "100%" : sm ? "90%" : md ? "450px" : "500px";

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: 16,
      }}
    >
      <Form
        name="reset_password"
        className="reset-password-form"
        onFinish={onFinish}
        style={{
          width: formWidth,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 24,
          backgroundColor: "#ffffff",
        }}
        layout="vertical"
      >
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Đặt lại mật khẩu
        </Typography.Title>

        <Form.Item
          label="Mật khẩu mới"
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
          ]}
          hasFeedback
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirm"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Nhập lại mật khẩu"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            block
            style={{ backgroundColor: "black" }}
          >
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default ResetPasswordPage;
