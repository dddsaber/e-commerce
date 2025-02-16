import { UserOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth.api";
import bg from "../../assets/bookbg.jpg";

const ForgotPasswordPage = () => {
  const onFinish = async (values) => {
    const response = await forgotPassword(values);
    if (response.status) {
      alert("An email has been sent to your address. Please check it.");
    } else {
      alert("Failed to send email. Please try again.");
    }
  };
  return (
    <div>
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
            Enter your email
          </Typography.Title>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Email must be provided",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="site-form-item-icons" />}
              placeholder="Phone/Email"
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
              Send email
            </Button>
            <Space>
              <Link to="/login">Already have account</Link>
            </Space>
            <Space>&nbsp;</Space>
            <Space>
              <Link to="/register">Register now!</Link>
            </Space>
          </Form.Item>
        </Form>
      </Flex>
    </div>
  );
};

export default ForgotPasswordPage;
