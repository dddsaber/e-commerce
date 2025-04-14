import React from "react";
import { Layout, theme, Grid } from "antd";
import { Outlet } from "react-router-dom";
import ModifyHeader from "../../components/layout/ModifyHeader";
import Modifyfooter from "../../components/layout/ModifiFooter";
import ChatBot from "../../components/chat/ChatBot";

const { Content } = Layout;
const { useBreakpoint } = Grid; // Hook useBreakpoint để lấy các giá trị breakpoints

const App: React.FC = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const screens = useBreakpoint(); // Dùng hook để lấy thông tin breakpoints

  return (
    <Layout>
      <ModifyHeader />
      <Content
        style={{
          margin: screens.md ? "0 150px" : screens.sm ? "0 30px" : "0 10px", // Điều chỉnh margin tùy theo breakpoint
          padding: screens.md
            ? "24px 16px 0 16px"
            : screens.sm
            ? "12px"
            : "10px", // Điều chỉnh padding
          minHeight: 280,
          backgroundColor: "#f5f5f5", // Màu nền xám cho background
          overflow: "auto",
          borderRadius: screens.md ? borderRadiusLG : "5px", // Border radius thay đổi theo kích thước màn hình
          height: screens.xs ? "auto" : "100%", // Điều chỉnh chiều cao theo kích thước màn hình
        }}
      >
        <Outlet />
        <ChatBot />
      </Content>
      <Modifyfooter />
    </Layout>
  );
};

export default App;
