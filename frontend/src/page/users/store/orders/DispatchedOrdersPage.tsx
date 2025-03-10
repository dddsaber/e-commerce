import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { getStoreByUserId } from "../../../../api/store.api";
import { Store } from "../../../../type/store.type";
import { Breadcrumb } from "antd";
import StoreOrderTable from "../../../../components/orders/StoreOrderTable";
import { Order } from "../../../../type/order.type";
import { STATUS_MAP } from "../../../../utils/constant";
import TableSkeleton from "../../../../components/layout/TableSkeleton";

const DispatchedOrdersPage: React.FC = () => {
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
            href: "/store-manage/cancel-orders",
            title: "Đơn hàng bị hủy",
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
              <StoreOrderTable
                setSelectedOrder={setSelectedOrder}
                showDrawer={showDrawer}
                loading={loading}
                setLoading={setLoading}
                reload={reload}
                setReload={setReload}
                status={STATUS_MAP.shipped.value}
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

export default DispatchedOrdersPage;
