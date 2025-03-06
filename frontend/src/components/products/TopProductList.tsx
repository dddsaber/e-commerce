import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../../type/product.type";
import { getProducts } from "../../api/product.api";
import { Flex } from "antd";

const TopProductList: React.FC = () => {
  const [productsList, setProductsList] = useState<Product[]>();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts({ limit: 6 });
      setProductsList(data.products);
    };
    fetchProducts();
  }, []);
  return (
    <Flex style={{ flexDirection: "column" }} gap={10}>
      {productsList?.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </Flex>
  );
};

export default TopProductList;
