import { UserOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Typography, Grid } from "antd";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth.api";

const ForgotPasswordPage = () => {
  const { xs, sm, md } = Grid.useBreakpoint();

  const onFinish = async (values: { email: string }) => {
    const response = await forgotPassword(values);
    if (response.status) {
      alert("An email has been sent to your address. Please check it.");
    } else {
      alert("Failed to send email. Please try again.");
    }
  };

  const formWidth = xs ? "100%" : sm ? "90%" : md ? "450px" : "500px";

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: "100%",
        padding: 16,
      }}
    >
      <Form
        name="forgot_password"
        className="forgot-password-form"
        initialValues={{ remember: true }}
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
          Forgot Password
        </Typography.Title>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email must be provided" },
            { type: "email", message: "Email is not valid" },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="Enter your email address"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            style={{ marginBottom: 10, backgroundColor: "black" }}
            block
          >
            Send Email
          </Button>

          <Flex justify="space-between" wrap="wrap" gap={8}>
            <Link to="/login">Already have an account?</Link>
            <Link to="/register">Register now!</Link>
          </Flex>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default ForgotPasswordPage;
