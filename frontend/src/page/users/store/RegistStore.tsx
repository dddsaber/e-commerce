import React from "react";
import MultiStepForm from "../../../components/stores/MultiStepForm";
import { Button, Dropdown, Flex, Layout, MenuProps, theme } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { UserOutlined } from "@ant-design/icons";
import { getSourceImage } from "../../../utils/handle_image_func";
import { useNavigate } from "react-router-dom";

const RegistStore: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: "Log Out",
      onClick: () => navigate("/logout"),
    },
  ];
  return (
    <Layout>
      <Layout.Header style={{ background: "#fff", minHeight: "7vh" }}>
        <Flex
          style={{
            height: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ fontSize: "24px" }}>Đăng ký cửa hàng</h1>
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
            <Button
              type="text"
              style={{
                marginRight: 0,
                marginLeft: 10,
                fontWeight: "bold",
              }}
              icon={
                user?.avatar ? (
                  <img
                    style={{
                      borderRadius: "50%",
                      position: "absolute",
                      left: -8,
                      top: 0,
                      height: 30,
                      width: 30,
                      objectFit: "cover",
                      marginRight: 2,
                    }}
                    src={getSourceImage(user.avatar)}
                  />
                ) : (
                  <UserOutlined />
                )
              }
            >
              <span>{user ? user.username : ""}</span>
            </Button>
          </Dropdown>
        </Flex>
      </Layout.Header>
      <Layout.Content
        style={{
          margin: "0 150px",
          padding: "24px 16px 0 16px",
          minHeight: "93vh",
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          overflow: "auto",
          backgroundColor: "#f5f5f5",
        }}
      >
        <MultiStepForm />
      </Layout.Content>
    </Layout>
  );
};

export default RegistStore;
