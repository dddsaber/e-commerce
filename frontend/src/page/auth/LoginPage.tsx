import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Divider, Flex, Form, Input, Space, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  loginAuth,
  // loginFacebookAuth,
  // loginGithubAuth,
  loginGoogleAuth,
} from "../../redux/slices/authSlice";
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

  // const onLoginOAuth2 = async (key: string) => {
  //   try {
  //     if (key === "github") {
  //       const { user } = await dispatch(loginGithubAuth({})).unwrap();
  //       handleNavigate(user);
  //     } else if (key === "facebook") {
  //       const { user } = await dispatch(loginFacebookAuth({})).unwrap();

  //       handleNavigate(user);
  //     } else {
  //       navigate("/login");
  //     }
  //   } catch (error) {
  //     console.error("Login OAuth2 failed:", error);
  //     navigate("/login");
  //   }
  // };

  const handleLoginSuccess = async (response: CredentialResponse) => {
    try {
      if (!response.credential) {
        throw new Error("No credentials were found!");
      }

      const { credential } = response;
      const result = await dispatch(loginGoogleAuth({ token: credential }));
      console.log(result);
      const { user } = result.payload;
      handleNavigate(user);
    } catch (error) {
      console.error("Login Google failed:", error);
      navigate("/login");
    }
  };

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: "100%",
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{
          width: "450px",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Login
        </Typography.Title>
        <Form.Item
          name="identifier"
          rules={[
            {
              required: true,
              message: "Phone/Email must be provided",
            },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined className="site-form-item-icons" />}
            placeholder="Phone/Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Password must be provided",
            },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="site-form-item-icons" />}
            placeholder="Password"
            type="password"
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
            Log in
          </Button>
          <Space>
            <Link to="/forgot-password">Forgot password?</Link>
          </Space>
          <Space>&nbsp;</Space>
          <Space>
            <Link to="/register">Register now!</Link>
          </Space>
        </Form.Item>
      </Form>
      <Flex
        justify="center"
        align="center"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Divider />

        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => {
            console.error("Login Google failed");
            navigate("/login");
          }}
          useOneTap={false}
        />
      </Flex>
    </Flex>
  );
};

export default LoginPage;
