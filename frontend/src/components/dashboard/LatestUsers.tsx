import { useEffect, useState } from "react";
import { Card, List, Typography, Spin, Avatar } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface User {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  role: "user" | "shipper" | "admin" | "sales";
  avatar?: string;
  isActive: boolean;
  createdAt?: Date;
}

const fetchLatestUsers = async (): Promise<User[]> => {
  return [
    {
      _id: "1",
      username: "john_doe",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      avatar: "https://via.placeholder.com/40",
      isActive: true,
      createdAt: new Date(),
    },
    {
      _id: "2",
      username: "jane_smith",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      avatar: "https://via.placeholder.com/40",
      isActive: true,
      createdAt: new Date(),
    },
    {
      _id: "3",
      username: "mike_jones",
      name: "Mike Jones",
      email: "mike@example.com",
      role: "sales",
      avatar: "https://via.placeholder.com/40",
      isActive: false,
      createdAt: new Date(),
    },
    {
      _id: "4",
      username: "mike_jones",
      name: "Mike Jones",
      email: "mike@example.com",
      role: "sales",
      avatar: "https://via.placeholder.com/40",
      isActive: false,
      createdAt: new Date(),
    },
    {
      _id: "5",
      username: "mike_jones",
      name: "Mike Jones",
      email: "mike@example.com",
      role: "sales",
      avatar: "https://via.placeholder.com/40",
      isActive: false,
      createdAt: new Date(),
    },
  ];
};

export default function LatestUsers(): JSX.Element {
  const [latestUsers, setLatestUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchLatestUsers();
      setLatestUsers(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Card
      hoverable
      title={"Latest Users"}
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
          dataSource={latestUsers}
          renderItem={(user: User) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={user.avatar} />}
                title={<Text strong>{user.name || user.username}</Text>}
                description={user.email}
              />
              <Text strong>{user.role}</Text>
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
