import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Typography, Grid } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginAuth, loginGoogleAuth } from "../../redux/slices/authSlice";
import { TYPE_USER } from "../../utils/constant";
import { AppDispatch } from "../../redux/store";
import { User } from "../../type/user.type";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

interface LoginValues {
  identifier: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { xs, sm, md } = Grid.useBreakpoint();

  const handleNavigate = (user: User) => {
    switch (user?.role) {
      case TYPE_USER.admin:
        navigate("/admin");
        break;
      case TYPE_USER.user:
        navigate("/");
        break;
      case TYPE_USER.sales:
        navigate("/store-manage");
        break;
      case TYPE_USER.shipper:
        navigate("/");
        break;
      case TYPE_USER.logistic_provider:
        navigate("/delivery/all-deliveries");
        break;
      default:
        navigate("/login", { replace: true });
    }
  };

  const onFinish = async (values: LoginValues) => {
    values.identifier = values.identifier.trim();
    try {
      const { user } = await dispatch(loginAuth(values)).unwrap();
      handleNavigate(user);
    } catch (error) {
      console.error("Login failed:", error);
      navigate("/login");
    }
  };

  const handleLoginSuccess = async (response: CredentialResponse) => {
    try {
      if (!response.credential) {
        throw new Error("No credentials were found!");
      }
      const { credential } = response;
      const result = await dispatch(loginGoogleAuth({ token: credential }));
      const { user } = result.payload;
      handleNavigate(user);
    } catch (error) {
      console.error("Login Google failed:", error);
      navigate("/login");
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
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
        style={{
          width: formWidth,
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 24,
          backgroundColor: "#fff",
        }}
      >
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Login
        </Typography.Title>
        <Form.Item
          name="identifier"
          rules={[{ required: true, message: "Phone/Email must be provided" }]}
          label="Email/Số điện thoại"
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="Phone/Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Password must be provided" }]}
          label="Mật khẩu"
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Password"
            type="password"
          />
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            style={{ marginBottom: 10, backgroundColor: "black" }}
            block
          >
            Đăng nhập
          </Button>
          <Flex justify="space-between" wrap="wrap" gap={8}>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
            <Link to="/register">Đăng ký tài khoản!</Link>
          </Flex>
        </Form.Item>
        <Typography.Title
          level={5}
          style={{ textAlign: "center", marginTop: 16 }}
        >
          Hoặc
        </Typography.Title>
        <Flex justify="center" style={{ marginTop: 12 }}>
          <GoogleLogin
            width={xs ? "100%" : "300px"}
            onSuccess={handleLoginSuccess}
            onError={() => {
              console.error("Login Google failed");
              navigate("/login");
            }}
            useOneTap={false}
          />
        </Flex>
      </Form>
    </Flex>
  );
};

export default LoginPage;
