import React, { useEffect, useState } from "react";
import { Order } from "../../../type/order.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getOrders } from "../../../api/order.api";

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
  return <>my orders</>;
};

export default MyOrdersPage;
