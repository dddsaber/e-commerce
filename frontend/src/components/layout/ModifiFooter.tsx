import React from "react";
import { Row, Col, Typography, Space, Button } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Modifyfooter: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "#032F30 ",
        padding: "30px 0",
        color: "white",
        marginTop: "40px",
      }}
    >
      <Row
        gutter={[16, 16]}
        justify="space-between"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Thông tin thương hiệu */}
        <Col xs={24} md={6}>
          <Title level={3} style={{ color: "white" }}>
            Shopfiniti
          </Title>
          <Text style={{ color: "#B0B0B0" }}>
            Mua sắm không giới hạn, trải nghiệm tuyệt vời!
          </Text>
        </Col>

        {/* Danh mục liên kết */}
        <Col xs={24} md={6}>
          <Title level={5} style={{ color: "white" }}>
            Thông tin
          </Title>
          <Space direction="vertical" size="small">
            <Button type="link" style={{ color: "#B0B0B0" }} href="#">
              Chính sách bảo mật
            </Button>
            <Button type="link" style={{ color: "#B0B0B0" }} href="#">
              Điều khoản dịch vụ
            </Button>
            <Button type="link" style={{ color: "#B0B0B0" }} href="#">
              Hỗ trợ khách hàng
            </Button>
            <Button type="link" style={{ color: "#B0B0B0" }} href="#">
              Liên hệ
            </Button>
          </Space>
        </Col>

        {/* Mạng xã hội */}
        <Col xs={24} md={6}>
          <Title level={5} style={{ color: "white" }}>
            Kết nối với chúng tôi
          </Title>
          <Space size="large">
            <Button
              shape="circle"
              icon={<FacebookOutlined />}
              style={{ backgroundColor: "#3b5998", color: "white" }}
            />
            <Button
              shape="circle"
              icon={<InstagramOutlined />}
              style={{ backgroundColor: "#e1306c", color: "white" }}
            />
            <Button
              shape="circle"
              icon={<TwitterOutlined />}
              style={{ backgroundColor: "#1DA1F2", color: "white" }}
            />
          </Space>
        </Col>

        {/* Bản quyền */}
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <Text style={{ color: "#B0B0B0" }}>
            © {new Date().getFullYear()} Shopfiniti. All rights reserved.
          </Text>
        </Col>
      </Row>
    </div>
  );
};

export default Modifyfooter;
