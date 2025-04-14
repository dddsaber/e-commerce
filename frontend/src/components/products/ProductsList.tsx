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
            <Col
              key={product._id}
              xs={24} // 1 sản phẩm / dòng trên màn hình nhỏ (<576px)
              sm={12} // 2 sản phẩm / dòng (≥576px)
              md={8} // 3 sản phẩm / dòng (≥768px)
              lg={6} // 4 sản phẩm / dòng (≥992px)
              xl={4} // 6 sản phẩm / dòng (≥1200px)
            >
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </InfiniteScroll>
    </>
  );
};

export default ProductsList;
