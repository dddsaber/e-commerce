import React, { useState } from "react";
import ProductTable from "../../../components/products/ProductTable";
import ProductDrawer from "../../../components/products/ProductDrawer";
import { Product } from "../../../type/product.type";
import { Breadcrumb } from "antd";

const ProductsManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined
  );
  const onClose = () => {
    setSelectedProduct(undefined);
    setIsVisible(false);
  };

  const showDrawer = () => {
    setIsVisible(true);
  };

  return (
    <div>
      <Breadcrumb
        items={[
          {
            href: "/admin",
            title: "Trang chủ",
          },
          {
            href: "/admin/manage-products",
            title: "Quản lý sản phẩm",
          },
        ]}
      />
      <ProductTable
        setSelectedProduct={setSelectedProduct}
        showDrawer={showDrawer}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
      />
      <ProductDrawer
        visible={isVisible}
        onClose={onClose}
        selectedProduct={selectedProduct}
        loading={loading}
        setLoading={setLoading}
        setSelectedProduct={setSelectedProduct}
        reload={reload}
        setReload={setReload}
      />
    </div>
  );
};

export default ProductsManagePage;
