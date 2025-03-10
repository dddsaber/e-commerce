import { Button, Result } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
const UnAuthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
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

export default UnAuthorizedPage;
