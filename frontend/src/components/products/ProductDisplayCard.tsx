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

interface ProductDisplayCardProps {
  product: Product;
  addCart: (product: Product, quantity: number) => void;
}

const ProductDisplayCard: React.FC<ProductDisplayCardProps> = ({
  product,
  addCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Image
            src={getSourceImage(product?.image || "")}
            style={{ width: "100%" }}
          />
          <Row
            gutter={[8, 8]}
            style={{ justifyContent: "start", margin: "10px 0" }}
          >
            {product?.sideImages!.slice(0, 3).map((img, index) => (
              <Col key={index}>
                <Image
                  width={80}
                  height={80}
                  src={getSourceImage(product.sideImages![index])}
                  style={{ border: "1px solid grey", borderRadius: "2px" }}
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
          </Row>
        </Col>
        <Col
          span={16}
          style={{
            paddingLeft: "50px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Card>
            {/* Phần nội dung sản phẩm */}
            <div style={{ flex: 1 }}>
              <Typography.Title
                level={2}
                style={{ margin: "0", textAlign: "center" }}
              >
                {product?.name}
              </Typography.Title>

              <Flex
                style={{
                  justifyContent: "space-between",
                  fontSize: "18px",
                  margin: "10px 0",
                }}
                gap={10}
              >
                <Flex gap={24}>
                  <span
                    style={{ fontWeight: "bold", textDecoration: "underline" }}
                  >
                    {product?.rating}
                  </span>
                  <Rate value={product?.rating} />
                  <span>{product?.numberOfRatings || 0} Đánh giá</span>
                  <span>{product?.inventory?.soldQuantity ?? 0} Đã bán</span>
                </Flex>
                <Button
                  type="text"
                  size="large"
                  onClick={() => setIsVisible(true)}
                >
                  Báo cáo
                </Button>
              </Flex>

              <Flex
                style={{
                  backgroundColor: "#f7f7f7",
                  padding: "15px 20px 50px",
                  alignItems: "center",
                  borderRadius: "5px",
                  margin: "15px 0",
                }}
                gap={10}
              >
                <Typography.Title level={1} style={{ color: "red", margin: 0 }}>
                  {(
                    (product?.price ?? 0) *
                    (1 - (product?.discount ?? 0))
                  ).toLocaleString("vi-VN")}{" "}
                  đ
                </Typography.Title>
                <Typography.Title
                  level={2}
                  style={{
                    textDecoration: "line-through",
                    color: "gray",
                    margin: 0,
                  }}
                >
                  {product?.price.toLocaleString("vi-VN")} đ
                </Typography.Title>
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "16px",
                    backgroundColor: "#f4b3b3",
                  }}
                >
                  -{(product?.discount || 0) * 100}%
                </span>
              </Flex>
            </div>
            <Flex style={{ marginTop: 20 }}>
              <Descriptions
                column={1}
                style={{ margin: "10px 0" }}
                styles={{
                  label: { fontSize: "20px" },
                  content: { fontSize: "18px" },
                }}
              >
                <Descriptions.Item label="Loại sản phẩm">
                  {product?.category?.name ?? "Chưa phân loại"}
                </Descriptions.Item>
                <Descriptions.Item label="Vận chuyển">
                  Nhận vận chuyển từ hôm nay{" "}
                </Descriptions.Item>
                <Descriptions.Item label="Kích cỡ">
                  {product?.size || ""}
                </Descriptions.Item>
                <Descriptions.Item
                  label="Số lượng"
                  style={{ margin: "30px 0" }}
                >
                  <Flex
                    align="center"
                    style={{ border: "1px solid #ddd", borderRadius: 5 }}
                  >
                    <Button
                      type="text"
                      style={{ width: 30, height: 30, fontSize: 30 }}
                    >
                      -
                    </Button>
                    <Input
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      readOnly
                      style={{
                        width: 50,
                        textAlign: "center",
                        border: "none",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    />
                    <Button
                      type="text"
                      style={{ width: 30, height: 30, fontSize: 25 }}
                    >
                      +
                    </Button>
                  </Flex>
                  <Flex>
                    <Typography.Text
                      style={{ marginLeft: 10, marginBottom: 20 }}
                    >
                      ({product?.inventory?.quantity} sản phẩm có sẵn)
                    </Typography.Text>
                  </Flex>
                </Descriptions.Item>
              </Descriptions>
            </Flex>
            {/* Nút hành động (ở dưới cùng) */}
            <Flex style={{ marginTop: 40, marginBottom: 10 }}>
              <Button
                style={{
                  height: 65,
                  width: 250,
                  fontSize: 18,
                  color: "red",
                  backgroundColor: "white",
                  border: "1px solid red",
                  borderRadius: 5,
                }}
                onClick={() => addCart(product!, quantity)}
              >
                Thêm Vào Giỏ Hàng
              </Button>
              <Button
                style={{
                  height: 65,
                  width: 250,
                  fontSize: 18,
                  marginLeft: 10,
                  color: "white",
                  backgroundColor: "red",
                  border: "1px solid white",
                  borderRadius: 5,
                }}
              >
                Mua Ngay
              </Button>
            </Flex>
          </Card>
        </Col>
      </Row>
      {product ? (
        <ReportModal
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          reportCategory={REPORT_TYPE.PRODUCT}
          reportedId={product?._id}
          reportItemName={product?.name}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default ProductDisplayCard;
