import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../../type/product.type";
import { getProducts } from "../../api/product.api";
import { Flex } from "antd";
interface TopProductListProps {
  storeId?: string;
}
const TopProductList: React.FC<TopProductListProps> = ({ storeId }) => {
  const [productsList, setProductsList] = useState<Product[]>();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts({
        limit: 6,
        isActive: true,
        storeId: storeId ?? undefined,
      });
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
