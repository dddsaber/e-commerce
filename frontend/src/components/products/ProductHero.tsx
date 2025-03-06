import React, { useEffect, useState } from "react";
import { Product } from "../../type/product.type";
import { Col, Flex, Row, Typography } from "antd";
import ProductCard from "./ProductCard";
import { getProducts } from "../../api/product.api";

interface ProductHeroProps {
  category: string;
}

const ProductHero: React.FC<ProductHeroProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts({ limit: 6 });
      setProducts(data.products);
    };
    fetchProducts();
  }, [category]);
  return (
    <>
      <Flex style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
        <Typography.Title level={4} style={{ textTransform: "uppercase" }}>
          {category}
        </Typography.Title>
        <Typography.Title level={4} style={{ color: "red" }}>
          Xem tat ca &gt;
        </Typography.Title>
      </Flex>
      <Row gutter={[12, 12]}>
        {products.map((product) => (
          <Col span={4} key={product._id}>
            <ProductCard key={product._id} product={product} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default ProductHero;
