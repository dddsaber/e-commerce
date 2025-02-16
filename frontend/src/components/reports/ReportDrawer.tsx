import React from "react";
import { Drawer, Button, Descriptions, Tag, message } from "antd";
import { Report } from "../../type/report.type";
import { handleReport, updateReportStatus } from "../../api/report.api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { handleError } from "../../utils/handle_error_func";

interface ReportDrawerProps {
  visible: boolean;
  reload: boolean;
  setReload: (value: boolean) => void;
  setSelectedReport: (value: Report | undefined) => void;
  onClose: () => void;
  selectedReport?: Report;
}

const ReportDrawer: React.FC<ReportDrawerProps> = ({
  visible,
  reload,
  setReload,
  setSelectedReport,
  onClose,
  selectedReport = undefined,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const handleHandler = async () => {
    try {
      const report = await handleReport(selectedReport!._id, user._id);
      if (report) {
        message.success("Báo cáo đã được xử lý thành công!");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setReload(!reload);
      setSelectedReport(undefined);
      onClose();
    }
  };

  const handleStatus = async (record: Report) => {
    try {
      const response = await updateReportStatus(record._id, !record.isDeleted);
      if (response) {
        if (!response.isDeleted) message.success("Report has been unblocked!");
        else message.success("Report has been blocked!");
        onClose();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setReload(!reload);
    }
  };

  return (
    <Drawer
      title={selectedReport?.title ? "Xử lý báo cáo" : ""}
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button
            disabled={selectedReport?.isHandle ? true : false}
            type="primary"
            onClick={() => handleHandler()}
            style={{ marginRight: 8 }}
          >
            Đánh dấu đã xử lý
          </Button>
          <Button type="primary" onClick={() => handleStatus(selectedReport!)}>
            {selectedReport?.isDeleted ? "Khôi phục" : "Xóa"}
          </Button>
        </div>
      }
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="ID">{selectedReport?._id}</Descriptions.Item>
        <Descriptions.Item label="Người báo cáo">
          {selectedReport?.userId}
        </Descriptions.Item>
        <Descriptions.Item label="Quản trị viên xử lý">
          {selectedReport?.adminId || "Chưa xử lý"}
        </Descriptions.Item>
        <Descriptions.Item label="Tiêu đề">
          {selectedReport?.title}
        </Descriptions.Item>
        <Descriptions.Item label="Nội dung">
          {selectedReport?.content}
        </Descriptions.Item>
        {selectedReport?.linkTo && (
          <Descriptions.Item label="Liên kết">
            <a
              href={selectedReport.linkTo}
              target="_blank"
              rel="noopener noreferrer"
            >
              {selectedReport.linkTo}
            </a>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Loại báo cáo">
          <Tag color="blue">{selectedReport?.reportCategory}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="ID đối tượng bị báo cáo">
          {selectedReport?.reportedId}
        </Descriptions.Item>
        <Descriptions.Item label="Xử lý">
          {selectedReport?.isHandle ? (
            <Tag color="green">Đã xử lý</Tag>
          ) : (
            <Tag color="red">Chưa xử lý</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {selectedReport?.isDeleted ? (
            <Tag color="red">Đã xóa</Tag>
          ) : (
            <Tag color="green">Tồn tại</Tag>
          )}
        </Descriptions.Item>
        {selectedReport?.createdAt && (
          <Descriptions.Item label="Ngày tạo">
            {new Date(selectedReport.createdAt).toLocaleString()}
          </Descriptions.Item>
        )}
        {selectedReport?.updatedAt && (
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(selectedReport.updatedAt).toLocaleString()}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Drawer>
  );
};

export default ReportDrawer;
