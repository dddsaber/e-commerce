import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getStoreByUserId } from "../../../api/store.api";
import { Store } from "../../../type/store.type";
import { Breadcrumb } from "antd";
import { Order } from "../../../type/order.type";
import TableSkeleton from "../../../components/layout/TableSkeleton";
import OrdersDisplay from "../../../components/orders/OrdersDisplay";

const OrdersPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [store, setStore] = useState<Store>();
  const [selectedOrder, setSelectedOrder] = useState<Order>();
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const showDrawer = () => {};

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

  return (
    <div>
      <Breadcrumb
        items={[
          {
            href: "/store-manage/dashboard",
            title: "Bảng điều khiển",
          },
          {
            href: "/store-manage/all-orders",
            title: "Tất cả đơn hàng",
          },
        ]}
      />

      {/* Kiểm tra nếu storeId có thì mới hiển thị bảng sản phẩm */}
      {!store && loading ? (
        <TableSkeleton />
      ) : (
        <>
          {store?._id ? (
            <>
              <OrdersDisplay
                setSelectedOrder={setSelectedOrder}
                showDrawer={showDrawer}
                loading={loading}
                setLoading={setLoading}
                reload={reload}
                setReload={setReload}
                status={undefined}
                selectedOrder={selectedOrder}
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

export default OrdersPage;
