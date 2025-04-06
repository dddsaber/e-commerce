import React from "react";
import { Layout, theme } from "antd";
import { Outlet } from "react-router-dom";
import ModifyHeader from "../../components/layout/ModifyHeader";
import Modifyfooter from "../../components/layout/ModifiFooter";
const { Content } = Layout;

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <ModifyHeader />
      <Content
        style={{
          margin: "0 150px",
          padding: "24px 16px 0 16px",
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          overflow: "auto",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Outlet />
      </Content>
      <Modifyfooter />
    </Layout>
  );
};

export default App;
