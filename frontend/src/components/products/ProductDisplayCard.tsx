import {
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Image,
  Input,
  Rate,
  Row,
  Typography,
} from "antd";
import React, { useState } from "react";
import { Product } from "../../type/product.type";

import { getSourceImage } from "../../utils/handle_image_func";
import { PlusOutlined } from "@ant-design/icons";
import ReportModal from "../reports/ReportModal";
import { REPORT_TYPE } from "../../utils/constant";
import { useNavigate } from "react-router-dom";

interface ProductDisplayCardProps {
  product: Product;
  addCart: (product: Product, quantity: number) => void;
}

const ProductDisplayCard: React.FC<ProductDisplayCardProps> = ({
  product,
  addCart,
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <>
      <Row gutter={[24, 24]} wrap>
        {/* Ảnh sản phẩm */}
        <Col xs={24} md={10}>
          <Image
            src={getSourceImage(product?.image || "")}
            style={{
              width: "100%",
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
          <Row
            gutter={[8, 8]}
            style={{ justifyContent: "start", margin: "10px 0" }}
          >
            {product?.sideImages?.slice(0, 3).map((img, index) => (
              <Col key={index}>
                <Image
                  width={80}
                  height={80}
                  src={getSourceImage(img)}
                  style={{ border: "1px solid #ddd", borderRadius: 5 }}
                />
              </Col>
            ))}
            {(product?.sideImages?.length || 0) > 7 && (
              <Col>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  style={{
                    width: 80,
                    height: 80,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  +{(product?.sideImages?.length ?? 0) - 3}
                </Button>
              </Col>
            )}
          </Row>
        </Col>

        {/* Nội dung sản phẩm */}
        <Col xs={24} md={14}>
          <Card style={{ borderRadius: 10 }}>
            <Typography.Title
              level={2}
              style={{ marginBottom: 10, textAlign: "center" }}
            >
              {product?.name}
            </Typography.Title>

            {/* Đánh giá + báo cáo */}
            <Flex
              wrap="wrap"
              justify="space-between"
              style={{ marginBottom: 16 }}
            >
              <Flex gap={16} align="center" wrap="wrap">
                <Typography.Text strong underline>
                  {product?.rating}
                </Typography.Text>
                <Rate value={product?.rating} disabled />
                <Typography.Text>
                  {product?.numberOfRatings || 0} đánh giá
                </Typography.Text>
                <Typography.Text>
                  {product?.inventory?.soldQuantity ?? 0} đã bán
                </Typography.Text>
              </Flex>
              <Button type="text" onClick={() => setIsVisible(true)}>
                Báo cáo
              </Button>
            </Flex>

            {/* Giá */}
            <Flex
              wrap="wrap"
              align="center"
              style={{
                background: "#fff1f0",
                padding: 20,
                borderRadius: 8,
                marginBottom: 20,
              }}
              gap={16}
            >
              <Typography.Title level={1} style={{ color: "red", margin: 0 }}>
                {(
                  (product?.price ?? 0) *
                  (1 - (product?.discount ?? 0))
                ).toLocaleString("vi-VN")}{" "}
                đ
              </Typography.Title>
              <Typography.Text delete style={{ fontSize: 20, color: "#999" }}>
                {product?.price?.toLocaleString("vi-VN")} đ
              </Typography.Text>
              <Typography.Text
                style={{
                  backgroundColor: "#ffa39e",
                  padding: "4px 10px",
                  borderRadius: 4,
                  color: "#a8071a",
                  fontWeight: "bold",
                }}
              >
                -{(product?.discount || 0) * 100}%
              </Typography.Text>
            </Flex>

            {/* Mô tả sản phẩm */}
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 1, md: 1, xxl: 1, lg: 1, xl: 1 }}
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Loại sản phẩm">
                {product?.category?.name ?? "Chưa phân loại"}
              </Descriptions.Item>
              <Descriptions.Item label="Kích cỡ">
                {product?.size || "Không có"}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                <Flex gap={8} align="center">
                  <Button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    value={quantity}
                    readOnly
                    style={{
                      width: 60,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  />
                  <Button
                    onClick={() =>
                      quantity < (product?.inventory?.quantity ?? 0) &&
                      setQuantity(quantity + 1)
                    }
                  >
                    +
                  </Button>
                  <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                    ({product?.inventory?.quantity ?? 0} sản phẩm có sẵn)
                  </Typography.Text>
                </Flex>
              </Descriptions.Item>
            </Descriptions>

            {/* Nút hành động */}
            <Flex
              wrap="wrap"
              justify="start"
              gap={16}
              style={{ marginTop: 20 }}
            >
              <Button
                size="large"
                style={{
                  minWidth: 180,
                  color: "red",
                  backgroundColor: "white",
                  border: "1px solid red",
                  borderRadius: 5,
                }}
                onClick={() => addCart(product, quantity)}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="large"
                style={{
                  minWidth: 180,
                  color: "white",
                  backgroundColor: "red",
                  border: "1px solid white",
                  borderRadius: 5,
                }}
                onClick={() => {
                  addCart(product, quantity);
                  navigate("/cart");
                }}
              >
                Mua ngay
              </Button>
            </Flex>
          </Card>
        </Col>

        {/* Modal báo cáo */}
        {product && (
          <ReportModal
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            reportCategory={REPORT_TYPE.PRODUCT}
            reportedId={product._id}
            reportItemName={product.name}
          />
        )}
      </Row>
    </>
  );
};

export default ProductDisplayCard;
