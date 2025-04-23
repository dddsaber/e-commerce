import React, { useEffect, useState } from "react";
import { Review } from "../../type/review.type";
import {
  Avatar,
  Card,
  Col,
  Flex,
  message,
  Pagination,
  Rate,
  Row,
  Typography,
} from "antd";
import { getReviews } from "../../api/review.api";
import { formatDate } from "../../utils/handle_format_func";
import { getSourceImage } from "../../utils/handle_image_func";

interface ReviewListProps {
  productId?: string;
  rating?: number;
}
const ReviewList: React.FC<ReviewListProps> = ({ productId, rating }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const limit = 8;
  useEffect(() => {
    const fetchData = async () => {
      const data = await getReviews({
        productId: productId,
        ratings: rating ? [rating] : [],
        skip: (current - 1) * limit,
        limit: limit,
      });
      if (!data) {
        message.error("Error fetching reviews");
        return;
      }
      setReviews(data.reviews);
      setTotalReviews(data.totalReviews);
      console.log(data);
    };
    fetchData();
  }, [productId, current, rating]);
  const handlePageChange = (page: number) => {
    setCurrent(page); // Cập nhật trang hiện tại
  };
  return (
    <>
      {/* Render list of reviews */}
      {reviews.map((review) => (
        <div key={review._id}>
          <Card key={review._id} style={{ margin: "20px 0", border: "none" }}>
            <Row gutter={[12, 12]}>
              <Col span={2}>
                <Avatar
                  src={getSourceImage(review?.user!.avatar ?? new Date())}
                  style={{ height: 50, width: 50 }}
                />
              </Col>
              <Col span={1}></Col>
              <Col
                span={21}
                style={{
                  justifyContent: "flex-start",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {review.user?.username}
                </Typography.Title>
                <Rate disabled value={review.rating} />
                <Typography.Text>
                  {formatDate(review.updatedAt ?? new Date())}
                </Typography.Text>
              </Col>
              <Col span={3}></Col>
              <Col span={21}>{review.content}</Col>
            </Row>
          </Card>
          <hr
            style={{
              height: "1px",
              backgroundColor: "#e5e5e5",
              border: "none",
            }}
          />
        </div>
      ))}
      <Flex style={{ justifyContent: "center", marginTop: "15px" }}>
        <Pagination
          defaultCurrent={1}
          current={current}
          total={totalReviews}
          pageSize={limit}
          onChange={handlePageChange}
          size="default"
        />
      </Flex>
    </>
  );
};

export default ReviewList;
