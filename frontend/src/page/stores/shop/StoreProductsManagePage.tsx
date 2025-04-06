import React, { useEffect, useState } from "react";
import { Product } from "../../../type/product.type";
import ProductDrawer from "../../../components/products/ProductDrawer";
import StoreProductTable from "../../../components/products/StoreProductTable";
import { Store } from "../../../type/store.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getStoreByUserId } from "../../../api/store.api";
import TableSkeleton from "../../../components/layout/TableSkeleton";

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
      setLoading(true);
      const storeData = await getStoreByUserId(user._id);
      setStore(storeData);
      setLoading(false);
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
      {/* Kiểm tra nếu storeId có thì mới hiển thị bảng sản phẩm */}
      {!store && loading ? (
        <TableSkeleton />
      ) : (
        <>
          {store?._id ? (
            <>
              <StoreProductTable
                setSelectedProduct={setSelectedProduct}
                showDrawer={showDrawer}
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
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default StoreProductsManagePage;
