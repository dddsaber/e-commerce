import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Input,
  Rate,
  Row,
  Typography,
  Image,
  message,
  List,
  Divider,
} from "antd";
import { getProductById } from "../../../api/product.api";
import { Product } from "../../../type/product.type";
import { Review } from "../../../type/review.type";
import { createReview, getReviews } from "../../../api/review.api";
import { addCartItem } from "../../../api/cart.api";
import { RootState } from "../../../redux/store";
import { getSourceImage } from "../../../utils/handle_image_func";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const ProductDetail: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [avgRating, setAvgRating] = useState<number>(0);

  const { productId } = useParams();

  const fetchProduct = async () => {
    const res = await getProductById(productId || "");
    setProduct(res);
  };

  const fetchComments = async () => {
    const res = await getReviews({ productId: productId });
    setComments(res.reviews);
  };

  useEffect(() => {
    fetchProduct();
    fetchComments();
  }, [productId]);

  useEffect(() => {
    if (comments.length > 0) {
      const avg =
        comments.reduce((sum, c) => sum + c.rating, 0) / comments.length;
      setAvgRating(avg);
    } else {
      setAvgRating(0);
    }
  }, [comments]);

  const handleAddToCart = async (product: Product, quantity: number) => {
    const response = await addCartItem(user._id, product._id, quantity);
    if (response) {
      message.success(`${quantity} ${product.name} added to cart!`);
    }
  };

  const handlePostComment = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      if (!productId) {
        message.error("Sản phẩm không hợp lệ!");
        return;
      }

      if (rating === 0) {
        message.error("Vui lòng chọn số sao đánh giá!");
        return;
      }
      const res = await createReview({
        _id: "",
        productId: productId,
        userId: user._id,
        rating: rating,
        content: comment,
        isDeleted: false,
      });

      if (res) {
        await fetchComments();
        setComment("");
        setRating(0);
      }
    }
  };

  return (
    <>
      <Row gutter={[24, 24]} style={{ padding: "24px" }}>
        <Col span={10}>
          <Image
            src={getSourceImage(product?.image || "")}
            alt={product?.name}
            width="100%"
          />
          {(product?.sideImages?.length || 0) > 7 && (
            <Col>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                style={{
                  width: 80,
                  height: 100,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {product?.sideImages?.length || 0 - 6}
              </Button>
            </Col>
          )}
        </Col>
        <Col span={14}>
          <Card bordered>
            <Title level={3}>{product?.name}</Title>
            <Rate allowHalf value={avgRating} disabled />
            {avgRating > 0 && <Text> {avgRating.toFixed(1)} / 5</Text>}

            <Paragraph strong style={{ fontSize: "18px" }}>
              {(
                (product?.price ?? 0) *
                (1 - (product?.discount ?? 0))
              ).toLocaleString("vi-VN")}{" "}
              đ
            </Paragraph>
            <Paragraph
              type={
                (product?.inventory?.quantity || 0) > 0 ? "success" : "danger"
              }
            >
              {(product?.inventory?.quantity || 0) > 0
                ? `Còn hàng: ${product?.inventory?.quantity}`
                : "Hết hàng"}
            </Paragraph>
            {(product?.inventory?.quantity || 0) > 0 && (
              <Button type="primary" onClick={() => handleAddToCart}>
                Thêm vào giỏ hàng
              </Button>
            )}
          </Card>

          <Divider />
          <Title level={4}>Mô tả sản phẩm</Title>
          <Paragraph>{product?.description}</Paragraph>
        </Col>
      </Row>

      <Row style={{ padding: "24px" }}>
        <Col span={24}>
          <Title level={4}>Đánh giá & Bình luận</Title>

          <Rate
            value={rating}
            onChange={(value) => setRating(value)}
            onHoverChange={setHover}
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Viết bình luận và nhấn Enter..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handlePostComment}
          />
          <List
            itemLayout="horizontal"
            dataSource={comments}
            style={{ marginTop: 24 }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Image
                      src={getSourceImage(item.user?.avatar || "")}
                      alt={item.user?.username}
                      width={40}
                      preview={false}
                      style={{ borderRadius: "50%" }}
                    />
                  }
                  title={<Text strong>@{item.user?.name}</Text>}
                  description={
                    <>
                      <Rate
                        disabled
                        defaultValue={item.rating}
                        style={{ fontSize: 14 }}
                      />
                      <Paragraph style={{ margin: 0 }}>
                        {item.content}
                      </Paragraph>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </>
  );
};

export default ProductDetail;
