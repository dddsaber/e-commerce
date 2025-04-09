import { Form, Input, message, Modal } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { createReport } from "../../api/report.api";

interface ReportModalProps {
  reportCategory: string;
  reportId: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  reportCategory,
  reportId,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const record = { ...values, userId: user._id };
      const response = await createReport(record);
      if (!response) {
        message.error("Không thể báo cáo!");
      } else {
        message.success("Đã ghi nhận báo cáo!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Modal
      open={true}
      title={`Báo cáo ${reportCategory} ${reportId}`}
      okText="Báo cáo"
      destroyOnClose
      cancelText="Hủy"
      style={{ top: 10, width: 700 }}
      width={700}
      onOk={handleSave}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nội dung"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Dùng React.memo với kiểu props
export default React.memo(ReportModal);
