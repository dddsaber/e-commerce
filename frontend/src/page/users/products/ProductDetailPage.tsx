import React, { useEffect, useState } from "react";
import { Inventory, Product } from "../../../type/product.type";
import { getProductById, getRateAndSold } from "../../../api/product.api";
import { useParams } from "react-router-dom";
import {
  Breadcrumb,
  Card,
  Col,
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
import ProductsList from "../../../components/products/ProductsList";

const ProductDetailPage: React.FC = () => {
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [productDetails, setProductDetails] = useState<{
    totalReviews: number;
    rating: number;
    inventory: Inventory;
  }>({
    totalReviews: 0,
    rating: 0,
    inventory: {
      soldQuantity: 0,
      quantity: 0,
    },
  });
  const [rating, setRating] = useState("all");

  const handleRatingChange = (e: RadioChangeEvent) => {
    setRating(e.target.value);
  };
  const { productId } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      const data = await getProductById(productId || "");
      setProduct(data);
      const detailsData = await getRateAndSold(productId || "");
      setProductDetails(detailsData);
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
            href: "/",
            title: "San pham",
          },
        ]}
      />
      <ProductDisplayCard
        productId={productId!}
        productDetails={productDetails}
      />
      <StoreDisplayCard storeId={product?.storeId || ""} />
      <Row gutter={[20, 20]}>
        <Col span={20}>
          <Card>
            <Typography.Title
              level={3}
              style={{
                backgroundColor: "#f7f7f7",
                padding: "15px 20px 30px",
                alignItems: "center",
                borderRadius: "10px",
                margin: "0",
                textTransform: "uppercase",
              }}
            >
              Chi tiết sản phẩm
            </Typography.Title>
            <Typography.Text style={{ marginTop: 10 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              eleifend lobortis consectetur. Donec gravida ex vel dui efficitur,
              ac vestibulum felis tempus. Nullam vel velit libero. Sed auctor,
              nunc vel pharetra ultricies, mauris nisi tristique ligula, at
              placerat orci felis in velit. Sed id dolor sed nunc pulvinar
              finibus. Nulla facilisi. Donec vel libero et urna ornare placerat.
              Donec sodales, ipsum sit amet condimentum gravida, ipsum metus
              bibendum neque, vel vulputate ipsum ligula ut enim. Sed vel libero
              eu est posuere consectetur. Donec dignissim diam non neque
              lobortis, a facilisis mi ultricies.
            </Typography.Text>
            <Typography.Title
              level={3}
              style={{
                backgroundColor: "#f7f7f7",
                padding: "15px 20px 30px",
                alignItems: "center",
                borderRadius: "10px",
                margin: "50px 0 0",
                textTransform: "uppercase",
              }}
            >
              Mô tả sản phẩm
            </Typography.Title>
            <Typography.Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              eleifend lobortis consectetur. Donec gravida ex vel dui efficitur,
              ac vestibulum felis tempus. Nullam vel velit libero. Sed auctor,
              nunc vel pharetra ultricies, mauris nisi tristique ligula, at
              placerat orci felis in velit. Sed id dolor sed nunc pulvinar
              finibus. Nulla facilisi. Donec vel libero et urna ornare placerat.
              Donec sodales, ipsum sit amet condimentum gravida, ipsum metus
              bibendum neque, vel vulputate ipsum ligula ut enim. Sed vel libero
              eu est posuere consectetur. Donec dignissim diam non neque
              lobortis, a facilisis mi ultricies.
            </Typography.Text>
          </Card>
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
                alignItems: "center",
                borderRadius: "5px",
              }}
            >
              <Col span={5}>
                <Typography.Text
                  strong
                  style={{
                    fontSize: 26,
                    color: "red",
                    textAlign: "center",
                    marginLeft: 20,
                    marginBottom: 15,
                  }}
                >
                  <span style={{ fontSize: 36 }}>{productDetails.rating}</span>{" "}
                  / 5
                </Typography.Text>
                <Rate value={productDetails.rating} allowHalf />
              </Col>
              <Col
                span={19}
                style={{ justifyContent: "center", display: "flex" }}
              >
                <Radio.Group
                  value={rating}
                  onChange={handleRatingChange}
                  size="large"
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
            <ReviewList productId={productId} />
          </Card>
          <ProductsList />
        </Col>
        <Col span={4}>
          <TopProductList />
        </Col>
      </Row>
    </>
  );
};

export default ProductDetailPage;
