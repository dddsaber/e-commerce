import { useEffect, useState } from "react";
import { Card, List, Typography, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Order {
  id: number;
  name: string;
  email: string;
  amount: string;
}

const fetchLatestOrders = async (): Promise<Order[]> => {
  return [
    {
      id: 1,
      name: "Order #1001",
      email: "customer1@example.com",
      amount: "$250.00",
    },
    {
      id: 2,
      name: "Order #1002",
      email: "customer2@example.com",
      amount: "$300.00",
    },
    {
      id: 3,
      name: "Order #1003",
      email: "customer3@example.com",
      amount: "$150.00",
    },
    {
      id: 4,
      name: "Order #1003",
      email: "customer3@example.com",
      amount: "$150.00",
    },
    {
      id: 5,
      name: "Order #1003",
      email: "customer3@example.com",
      amount: "$150.00",
    },
  ];
};

export default function LatestOrders(): JSX.Element {
  const [latestOrders, setLatestOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchLatestOrders();
      setLatestOrders(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Card
      hoverable
      title={"Latest Orders"}
      styles={{
        header: {
          color: "#274D60",
          fontSize: 25,
          backgroundColor: "#fafafa",
        },
      }}
    >
      {loading ? (
        <Spin size="large" />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={latestOrders.slice(0, 2)}
          renderItem={(order: Order) => (
            <List.Item>
              <List.Item.Meta
                title={<Text strong>{order.name}</Text>}
                description={order.email}
              />
              <Text strong>{order.amount}</Text>
            </List.Item>
          )}
        />
      )}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <ReloadOutlined style={{ color: "gray" }} />
        <Text style={{ marginLeft: 8, color: "gray" }}>Updated just now</Text>
      </div>
    </Card>
  );
}
