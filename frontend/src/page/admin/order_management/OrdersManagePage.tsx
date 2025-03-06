import React, { useState } from "react";
import { Breadcrumb } from "antd";
import { Order } from "../../../type/order.type";
import OrderTable from "../../../components/orders/OrderTable";
import OrderDrawer from "../../../components/orders/OrderDrawer";

const OrdersManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(
    undefined
  );
  const onClose = () => {
    setSelectedOrder(undefined);
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
            href: "/admin/manage-orders",
            title: "Quản lý đơn hàng",
          },
        ]}
      />
      <OrderTable
        setSelectedOrder={setSelectedOrder}
        showDrawer={showDrawer}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
      />
      <OrderDrawer
        visible={isVisible}
        onClose={onClose}
        setSelectedOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
        reload={reload}
        setReload={setReload}
      />
    </div>
  );
};

export default OrdersManagePage;
