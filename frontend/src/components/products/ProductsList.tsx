import React, { useEffect, useState } from "react";
import { Product } from "../../type/product.type";
import { getProducts } from "../../api/product.api";
import { Card, Col, Row } from "antd";
import ProductCard from "./ProductCard";

const ProductsList: React.FC = () => {
  const [productsList, setProductsList] = useState<Product[]>();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts({ limit: 10 });
      setProductsList(data.products);
    };
    fetchProducts();
  }, []);

  return (
    <Row gutter={[12, 12]}>
      <Col span={24}>
        <Card
          title="GỢI Ý HÔM NAY"
          styles={{
            header: {
              textAlign: "center",
              fontSize: "25",
              textTransform: "capitalize",
            },
            body: {
              padding: "2px 0",
              backgroundColor: "red",
            },
          }}
        />
      </Col>

      {productsList?.map((product) => (
        <Col span={4} key={product.name}>
          <ProductCard key={product._id} product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductsList;
