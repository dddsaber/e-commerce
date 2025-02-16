import React from "react";
import { Drawer, Button, Descriptions, Tag, message, Rate } from "antd";
import { Review } from "../../type/review.type";
import { updateReviewStatus } from "../../api/review.api";
import { handleError } from "../../utils/handle_error_func";

interface ReviewDrawerProps {
  visible: boolean;
  reload: boolean;
  setReload: (value: boolean) => void;
  setSelectedReview: (value: Review | undefined) => void;
  onClose: () => void;
  selectedReview?: Review;
}

const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  visible,
  reload,
  setReload,
  setSelectedReview,
  onClose,
  selectedReview = undefined,
}) => {
  const handleStatus = async (record: Review) => {
    try {
      const response = await updateReviewStatus(record._id, !record.isDeleted);
      if (response) {
        if (!response.isDeleted) message.success("Review has been unblocked!");
        else message.success("Review has been blocked!");
        onClose();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSelectedReview(undefined);
      setReload(!reload);
    }
  };

  return (
    <Drawer
      title={selectedReview?.content ? "Xem bình luận" : ""}
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" onClick={() => handleStatus(selectedReview!)}>
            {selectedReview?.isDeleted ? "Khôi phục" : "Xóa"}
          </Button>
        </div>
      }
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="ID">{selectedReview?._id}</Descriptions.Item>
        <Descriptions.Item label="Mã tài khoản">
          {selectedReview?.userId}
        </Descriptions.Item>
        <Descriptions.Item label="Tên tài khoản">
          {selectedReview?.user?.username}
        </Descriptions.Item>
        <Descriptions.Item label="Mã sản phẩm">
          {selectedReview?.productId}
        </Descriptions.Item>
        <Descriptions.Item label="Tên sản phẩm">
          {selectedReview?.product?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Nội dung">
          {selectedReview?.content}
        </Descriptions.Item>
        <Descriptions.Item label="Đánh giá">
          <Rate disabled value={selectedReview?.rating} />
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          {selectedReview?.isDeleted ? (
            <Tag color="red">Đã xóa</Tag>
          ) : (
            <Tag color="green">Tồn tại</Tag>
          )}
        </Descriptions.Item>
        {selectedReview?.createdAt && (
          <Descriptions.Item label="Ngày tạo">
            {new Date(selectedReview.createdAt).toLocaleString()}
          </Descriptions.Item>
        )}
        {selectedReview?.updatedAt && (
          <Descriptions.Item label="Cập nhật lần cuối">
            {new Date(selectedReview.updatedAt).toLocaleString()}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Drawer>
  );
};

export default ReviewDrawer;
