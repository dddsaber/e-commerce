import React, { useState, useEffect } from "react";
import { Modal, Rate, Input, Button, message, Divider, Space } from "antd";
import { OrderDetails } from "../../type/order.type";
import {
  checkReviewExistence,
  createReview,
  updateReview,
  updateReviewStatus,
} from "../../api/review.api";
import { Review, ReviewInput } from "../../type/review.type";

interface ReviewModalMultiProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  products: OrderDetails[];
  userId: string;
}

const ReviewModalMulti: React.FC<ReviewModalMultiProps> = ({
  isVisible,
  setIsVisible,
  products,
  userId,
}) => {
  const [reviews, setReviews] = useState<ReviewInput[]>([]);
  const [hasReviews, setHasReviews] = useState<boolean[]>([]);
  const [isEditing, setIsEditing] = useState<boolean[]>([]); // Theo dõi chế độ chỉnh sửa

  useEffect(() => {
    if (isVisible) {
      const checkReviews = async () => {
        const newReviews: ReviewInput[] = [];
        const newHasReviews: boolean[] = [];
        const newIsEditing: boolean[] = [];

        for (const item of products) {
          const productId = item?.product?._id;
          if (!productId) continue;

          const response = await checkReviewExistence(userId, productId);
          console.log(response);
          newHasReviews.push(response.hasReview);
          newIsEditing.push(false);

          if (response.hasReview) {
            newReviews.push({
              ...response.review, // Bao gồm _id, để update/delete
              productId,
              userId,
            });
          } else {
            newReviews.push({
              productId,
              userId,
              rating: 0,
              content: "",
            });
          }
        }

        setReviews(newReviews);
        setHasReviews(newHasReviews);
        setIsEditing(newIsEditing);
      };

      checkReviews();
    }
  }, [isVisible, userId, products]);

  const handleChange = (
    index: number,
    field: keyof Pick<ReviewInput, "rating" | "content">,
    value: string | number
  ) => {
    const newReviews = [...reviews];
    newReviews[index] = {
      ...newReviews[index],
      [field]: value,
    };
    setReviews(newReviews);
  };

  const handleEditToggle = (index: number) => {
    const newEditing = [...isEditing];
    newEditing[index] = !newEditing[index];
    setIsEditing(newEditing);
  };

  const handleDelete = async (index: number) => {
    try {
      const reviewId = (reviews[index] as Review)?._id;
      if (!reviewId) return;

      await updateReviewStatus(reviewId, true);
      message.success("Xóa đánh giá thành công");

      const newHasReviews = [...hasReviews];
      const newReviews = [...reviews];
      const newEditing = [...isEditing];

      newHasReviews[index] = false;
      newEditing[index] = false;
      newReviews[index] = {
        productId: products[index].product?._id || "",
        userId,
        rating: 5,
        content: "",
      };

      setHasReviews(newHasReviews);
      setReviews(newReviews);
      setIsEditing(newEditing);
    } catch (err) {
      message.error("Xóa đánh giá thất bại!" + err);
    }
  };

  const handleSubmit = async () => {
    try {
      for (let i = 0; i < reviews.length; i++) {
        const content = reviews[i].content?.trim();
        const rating = reviews[i].rating;
        if (!content) continue; // Bỏ qua nếu content rỗng
        if (!rating || rating == 0) continue;

        if (hasReviews[i]) {
          if (isEditing[i]) {
            await updateReview((reviews[i] as Review)._id, reviews[i]);
          }
        } else {
          await createReview(reviews[i]);
        }
      }
      message.success("Gửi đánh giá thành công!");
      setIsVisible(false);
    } catch (err) {
      message.error("Gửi đánh giá thất bại!" + err);
    }
  };

  return (
    <Modal
      title="Đánh giá sản phẩm"
      open={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      width={700}
    >
      {products.map((item, index) => (
        <div key={item.product?._id}>
          <div style={{ fontWeight: "bold" }}>{item.product?.name}</div>

          {hasReviews[index] && !isEditing[index] ? (
            <>
              <Rate disabled value={reviews[index]?.rating} />
              <p>{reviews[index]?.content}</p>
              <Space>
                <Button onClick={() => handleEditToggle(index)}>
                  Chỉnh sửa
                </Button>
                <Button danger onClick={() => handleDelete(index)}>
                  Xóa
                </Button>
              </Space>
            </>
          ) : (
            <>
              <Rate
                value={reviews[index]?.rating || 0}
                onChange={(value) => handleChange(index, "rating", value)}
              />
              <Input.TextArea
                rows={3}
                placeholder="Nhập cảm nhận của bạn..."
                value={reviews[index]?.content || ""}
                onChange={(e) => handleChange(index, "content", e.target.value)}
              />
              {hasReviews[index] && (
                <Button onClick={() => handleEditToggle(index)}>
                  Hủy chỉnh sửa
                </Button>
              )}
            </>
          )}

          <Divider />
        </div>
      ))}

      <Button type="primary" block onClick={handleSubmit}>
        Gửi đánh giá
      </Button>
    </Modal>
  );
};

export default ReviewModalMulti;
