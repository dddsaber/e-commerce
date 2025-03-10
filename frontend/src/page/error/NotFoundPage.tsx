import { Button, Result } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại."
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Quay lại trang chủ
        </Button>
      }
      style={{
        fontSize: "30px",
      }}
    />
  );
};

export default NotFoundPage;
