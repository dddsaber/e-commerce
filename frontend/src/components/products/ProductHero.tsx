import React from "react";
import { Product } from "../../type/product.type";
import { Col, Row } from "antd";
import ProductCard from "./ProductCard";

interface ProductHeroProps {
  products: Product[];
}

const ProductHero: React.FC<ProductHeroProps> = ({ products }) => {
  return (
    <Row gutter={[12, 12]}>
      {products.map((product) => (
        <Col
          key={product._id}
          xs={24} // 1 cột trên màn hình nhỏ
          sm={12} // 2 cột trên màn hình nhỏ hơn 768px
          md={8} // 3 cột
          lg={6} // 4 cột
          xl={4} // 6 cột
        >
          <ProductCard product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductHero;
