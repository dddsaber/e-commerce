import React, { useEffect, useState } from "react";
import { Product } from "../../type/product.type";
import { getProducts } from "../../api/product.api";
import { Card, Col, Row, Spin } from "antd";
import ProductCard from "./ProductCard";
import InfiniteScroll from "react-infinite-scroll-component";

const ProductsList: React.FC = () => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async (page: number) => {
    const limit = 12;
    const data = await getProducts({ limit, skip: (page - 1) * limit });
    setProductsList((prev) => [...prev, ...data.products]);
    if (data.totalProducts < limit) setHasMore(false);
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  return (
    <Card
      title="GỢI Ý HÔM NAY"
      style={{ marginBottom: 12 }}
      headStyle={{
        textAlign: "center",
        fontSize: 25,
        textTransform: "capitalize",
      }}
    >
      <InfiniteScroll
        dataLength={productsList.length}
        next={() => setPage((prev) => prev + 1)}
        hasMore={hasMore}
        loader={
          <Spin style={{ display: "block", textAlign: "center", margin: 20 }} />
        }
        scrollThreshold={0.9} // 90% scroll sẽ trigger load tiếp
      >
        <Row gutter={[12, 12]}>
          {productsList.map((product) => (
            <Col span={4} key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </InfiniteScroll>
    </Card>
  );
};

export default ProductsList;
