import React, { useEffect, useState } from "react";
import { Breadcrumb, Flex, Spin } from "antd";
import { Product } from "../../../../type/product.type";
import ProductDrawer from "../../../../components/products/ProductDrawer";
import StoreProductTable from "../../../../components/products/StoreProductTable";
import { Store } from "../../../../type/store.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { getStoreByUserId } from "../../../../api/store.api";

const StoreProductsManagePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [store, setStore] = useState<Store>();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined
  );
  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) {
        return;
      }
      const storeData = await getStoreByUserId(user._id);
      setStore(storeData);
    };
    fetchData();
  }, [user]);
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
            href: "/store-manage/dashboard",
            title: "Bảng điều khiển",
          },
          {
            href: "/store-manage/products",
            title: "Quản lý sản phẩm",
          },
        ]}
      />

      {/* Kiểm tra nếu storeId có thì mới hiển thị bảng sản phẩm */}
      {store?._id ? (
        <>
          <StoreProductTable
            setSelectedProduct={setSelectedProduct}
            showDrawer={showDrawer}
            loading={loading}
            setLoading={setLoading}
            reload={reload}
            setReload={setReload}
            storeId={store._id}
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
            storeId={store._id}
          />
        </>
      ) : (
        <Flex style={{ justifyContent: "center", alignItems: "center" }}>
          <Spin size="large" />
        </Flex>
      )}
    </div>
  );
};

export default StoreProductsManagePage;
