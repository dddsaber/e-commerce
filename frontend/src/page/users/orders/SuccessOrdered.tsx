import { Button, Result } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const SuccessOrdered: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="success"
      title="Bạn đã đặt hàng thành công!"
      subTitle="Vui lòng kiểm tra lại ở phần đơn hàng của tôi."
      extra={[
        <Button
          type="primary"
          key="console"
          onClick={() => navigate("/my-orders")}
        >
          Xem đơn hàng
        </Button>,
        <Button key="buy" onClick={() => navigate("/")}>
          Về trang chủ
        </Button>,
      ]}
      style={{
        minHeight: "80vh",
      }}
    />
  );
};

export default SuccessOrdered;
