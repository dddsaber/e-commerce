import React, { useEffect, useState } from "react";
import { Product } from "../../type/product.type";
import { getRecommendProducts } from "../../api/product.api";
import { Card, Col, Row } from "antd";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface ProductListProps {
  storeId?: string;
}

const RecommendProduct: React.FC<ProductListProps> = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [RecommendProduct, setRecommendProduct] = useState<Product[]>([]);

  const fetchProducts = async () => {
    if (!user._id) return;
    const data = await getRecommendProducts(user._id);
    setRecommendProduct(data);
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return (
    <>
      <Card
        title="GỢI Ý HÔM NAY"
        style={{
          marginBottom: 12,
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
        }}
        styles={{
          header: {
            textAlign: "center",
            fontSize: 25,
            textTransform: "capitalize",
            backgroundColor: "white",
          },
          body: {
            backgroundColor: "red",
            height: 1,
            padding: 0, // đảm bảo không có padding làm cao hơn 1px
          },
        }}
      >
        {/* Không có nội dung bên trong nên body chỉ hiển thị 1px chiều cao màu đỏ */}
      </Card>

      <Row gutter={[12, 12]}>
        {RecommendProduct.map((product) => (
          <Col
            key={product._id}
            xs={24} // 1 sản phẩm / dòng trên màn hình nhỏ (<576px)
            sm={12} // 2 sản phẩm / dòng (≥576px)
            md={8} // 3 sản phẩm / dòng (≥768px)
            lg={6} // 4 sản phẩm / dòng (≥992px)
            xl={6} // 6 sản phẩm / dòng (≥1200px)
          >
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default RecommendProduct;
