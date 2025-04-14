import React, { useEffect, useState } from "react";
import { Order } from "../../../type/order.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getOrders } from "../../../api/order.api";
import OrderCard from "../../../components/orders/OrderCard";
import { Typography } from "antd";

const MyOrdersPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>();
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) return;
      console.log(user._id);
      const { orders, totalOrders } = await getOrders({ userId: user._id });
      setOrders(orders);
      console.log(orders);
      setTotalOrders(totalOrders);
    };
    fetchData();
  }, [user]);
  return (
    <>
      <Typography.Text>Tổng số đơn hàng đã mua: {totalOrders}</Typography.Text>
      {orders?.map((order) => (
        <OrderCard order={order} userId={user._id} />
      ))}
    </>
  );
};

export default MyOrdersPage;
