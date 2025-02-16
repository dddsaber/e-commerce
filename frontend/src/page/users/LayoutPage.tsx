import React, { useMemo } from "react";
import { Layout, Menu, theme, Typography } from "antd";
import { DashOutlined } from "@ant-design/icons";
import { Link, Outlet } from "react-router-dom";

const { Header, Content, Footer } = Layout;

type MenuItem = {
  key: string;
  icon: JSX.Element;
  label: string;
  link: string;
};

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuBars: MenuItem[] = useMemo(() => {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      key: "dashboards",
      icon: <DashOutlined />,
      label: "Bảng điều khirển",
      link: "/admin",
    });

    return menuItems;
  }, []);

  return (
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "space-between",
          justifyItems: "center",
        }}
      >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={menuBars}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Typography.Text style={{ marginRight: 20 }}>
          <Link to="/admin">Admin</Link>
        </Typography.Text>
        <Typography.Text>
          <Link to="/login">Login</Link>
        </Typography.Text>
      </Header>
      <Content
        style={{
          margin: 0,
          padding: "24px 16px 0 16px",
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          overflow: "auto",
          backgroundColor: "#eaeaea",
        }}
      >
        <Outlet />
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default App;
