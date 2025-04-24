// NotificationBell.tsx
import { Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";

interface Props {
  count: number;
}

export default function NotificationBell({ count }: Props) {
  return (
    <Badge
      count={<span style={{ fontSize: 15 }}>{count}</span>}
      offset={[0, 5]}
      style={{
        color: "white",
        background: "red",
        borderRadius: "10px",
        width: "15px",
        height: "15px",
      }}
    >
      <BellOutlined style={{ fontSize: 30, color: "black" }} />
    </Badge>
  );
}
