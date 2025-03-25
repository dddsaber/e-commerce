import { Button, Card, Form, Input, message } from "antd";
import React from "react";
import { updateUserPassword } from "../../../api/user.api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const ChangePasswordPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [form] = Form.useForm();

  const changePassword = () => {
    form
      .validateFields()
      .then(async (values) => {
        const { oldPassword, newPassword, retypeNewPassword } = values;
        if (newPassword !== retypeNewPassword) {
          message.error("Mật khẩu nhập lại không đúng!");
          return;
        }
        const response = await updateUserPassword(
          user._id,
          oldPassword,
          newPassword
        );
        if (response) {
          message.success("Đổi mật khẩu thành công!");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      })
      .finally(() => {
        form.resetFields();
      });
  };

  return (
    <Card
      title="Đổi mật khẩu"
      styles={{
        title: {
          textAlign: "center",
        },
      }}
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item name="oldPassword" label="Nhập mật khẩu cũ">
          <Input.Password style={{ width: 500 }} />
        </Form.Item>
        <Form.Item name="newPassword" label="Nhập mật khẩu mới">
          <Input.Password style={{ width: 500 }} />
        </Form.Item>
        <Form.Item name="retypeNewPassword" label="Nhập lại mật khẩu mới">
          <Input.Password style={{ width: 500 }} />
        </Form.Item>
        <Form.Item style={{ textAlign: "center" }}>
          <Button type="primary" onClick={changePassword}>
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordPage;
