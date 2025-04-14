import { Form, Input, message, Modal } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { createReport } from "../../api/report.api";
import { REPORT_TYPE_STR } from "../../utils/constant";

interface ReportModalProps {
  reportCategory: string;
  reportedId?: string;
  reportItemName?: string;
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  reportCategory,
  reportedId,
  reportItemName,
  isVisible,
  setIsVisible,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      if (!reportedId) {
        message.error("Không tìm được id!");
        return;
      }
      const values = await form.validateFields();
      const record = {
        ...values,
        userId: user._id,
        reportCategory,
        reportedId,
      };
      const response = await createReport(record);
      if (!response) {
        message.error("Không thể báo cáo!");
      } else {
        message.success("Đã ghi nhận báo cáo!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsVisible(false);
    }
  };
  return (
    <Modal
      open={isVisible}
      title={`Báo cáo ${
        REPORT_TYPE_STR[reportCategory as keyof typeof REPORT_TYPE_STR]
      } "${reportItemName}" (${reportedId})`}
      okText="Báo cáo"
      destroyOnClose
      cancelText="Hủy"
      style={{ top: 10, width: 700 }}
      width={700}
      onOk={handleSave}
      onCancel={() => setIsVisible(false)}
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
          name="content"
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
