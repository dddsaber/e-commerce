import React, { useEffect, useState } from "react";
import { Product } from "../../../type/product.type";
import { getProductById } from "../../../api/product.api";
import { useParams } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Col,
  message,
  Radio,
  RadioChangeEvent,
  Rate,
  Row,
  Typography,
} from "antd";
import ReviewList from "../../../components/reviews/ReviewList";
import ProductDisplayCard from "../../../components/products/ProductDisplayCard";
import StoreDisplayCard from "../../../components/products/StoreDisplayCard";
import TopProductList from "../../../components/products/TopProductList";
import { addCartItem } from "../../../api/cart.api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import RecommendProduct from "../../../components/products/RecommendProduct";

const ProductDetailPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [product, setProduct] = useState<Product | undefined>(undefined);

  const [rating, setRating] = useState("all");

  const addCart = async (product: Product, quantity: number) => {
    const response = await addCartItem(user._id, product._id, quantity);
    if (response) {
      message.success(`${quantity} ${product.name} added to cart!`);
    }
  };
  const handleRatingChange = (e: RadioChangeEvent) => {
    setRating(e.target.value);
  };
  const { productId } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getProductById(productId || "");
      setProduct(data);
    };
    fetchProduct();
  }, [productId]);

  return (
    <>
      {" "}
      <Breadcrumb
        items={[
          {
            href: "/",
            title: "Trang chủ",
          },
          {
            href: `/search?categories=${product?.category._id}`,
            title: `${product?.category.name}`,
          },
          {
            href: "/",
            title: `${product?.name}`,
          },
        ]}
      />
      <ProductDisplayCard product={product!} addCart={addCart} />
      <StoreDisplayCard storeId={product?.storeId || ""} />
      <Row gutter={[20, 20]} wrap>
        {/* Phần chính */}
        <Col xs={24} lg={20}>
          {/* Mô tả sản phẩm */}
          <Card>
            <Typography.Title
              level={3}
              style={{
                backgroundColor: "#f7f7f7",
                padding: "15px 20px 30px",
                borderRadius: "10px",
                margin: "50px 0 0",
                textTransform: "uppercase",
              }}
            >
              Mô tả sản phẩm
            </Typography.Title>
            <Typography.Text>{product?.description}</Typography.Text>
          </Card>

          {/* Đánh giá sản phẩm */}
          <Card
            title="ĐÁNH GIÁ SẢN PHẨM"
            style={{ margin: "20px 0", width: "100%" }}
            styles={{
              title: {
                fontSize: "22px",
              },
            }}
          >
            <Row
              gutter={[10, 10]}
              style={{
                backgroundColor: "#ffe3e3",
                padding: "15px 20px 30px",
                borderRadius: "5px",
              }}
              wrap
            >
              {/* Bên trái: Rating tổng */}
              <Col xs={24} md={6}>
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  <Typography.Text
                    strong
                    style={{
                      fontSize: 26,
                      color: "red",
                    }}
                  >
                    <span style={{ fontSize: 36 }}>{product?.rating}</span> / 5
                  </Typography.Text>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Rate value={product?.rating} allowHalf disabled />
                </div>
              </Col>

              {/* Bên phải: Bộ lọc sao */}
              <Col xs={24} md={18} style={{ textAlign: "center" }}>
                <Radio.Group
                  value={rating}
                  onChange={handleRatingChange}
                  size="large"
                  style={{ flexWrap: "wrap" }}
                >
                  <Radio.Button value="all">Tất cả</Radio.Button>
                  <Radio.Button value="0">0 Sao</Radio.Button>
                  <Radio.Button value="1">1 Sao</Radio.Button>
                  <Radio.Button value="2">2 Sao</Radio.Button>
                  <Radio.Button value="3">3 Sao</Radio.Button>
                  <Radio.Button value="4">4 Sao</Radio.Button>
                  <Radio.Button value="5">5 Sao</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>

            <ReviewList productId={productId} rating={parseInt(rating)} />
          </Card>

          {/* Gợi ý sản phẩm */}
          <RecommendProduct />
        </Col>

        {/* Sản phẩm nổi bật */}
        <Col xs={0} lg={4}>
          <TopProductList storeId={product?.storeId} />
        </Col>
      </Row>
    </>
  );
};

export default ProductDetailPage;
