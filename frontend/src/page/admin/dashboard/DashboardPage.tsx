import React from "react";
import CardWrapper from "../../../components/dashboard/CardWrapper";
import { Breadcrumb, Col, Row } from "antd";
import LineChart from "../../../components/dashboard/LineChart";
import BarChart from "../../../components/dashboard/BarChart";
import LatestOrders from "../../../components/dashboard/LatestOrders";
import LatestUsers from "../../../components/dashboard/LatestUsers";
import ReportOverview from "../../../components/dashboard/ReportOverview";

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Breadcrumb
        items={[
          {
            href: "/admin",
            title: "Trang chủ",
          },
        ]}
      />
      {/* Thông tin */}
      <CardWrapper />

      {/* Báo cáo */}
      <Row gutter={24} style={{ marginTop: 20 }}>
        <Col span={24}>
          <ReportOverview />
        </Col>
      </Row>
      {/* Biểu đồ  */}
      <Row gutter={24} style={{ marginTop: 20 }}>
        <Col span={12}>
          <LineChart />
        </Col>
        <Col span={12}>
          <BarChart />
        </Col>
      </Row>

      {/* Thông tin gần đây */}
      <Row gutter={24} style={{ marginTop: 20 }}>
        <Col span={12}>
          <LatestOrders />
        </Col>
        <Col span={12}>
          <LatestUsers />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
