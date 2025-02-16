import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Card } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
interface ClockProps {
  collapsed?: boolean;
}

const Clock: React.FC<ClockProps> = ({ collapsed = false }) => {
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(dayjs());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="flex items-center justify-center h-full"
      style={{ display: `${collapsed ? "none" : "block"}` }}
    >
      <Card className="p-4 shadow-lg flex items-center gap-2">
        <ClockCircleOutlined style={{ fontSize: "24px", color: "gray" }} />
        <span className="text-xl font-semibold">{time.format("HH:mm:ss")}</span>
      </Card>
    </div>
  );
};

export default Clock;
