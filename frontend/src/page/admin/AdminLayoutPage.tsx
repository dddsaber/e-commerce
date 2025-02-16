import {
  DashboardOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  FolderOutlined,
  FileTextOutlined,
  ReadOutlined,
  ProductOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { Button, Flex, Layout, Menu, Tag, Typography, theme } from "antd";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { colorOfType, TYPE_USER_STR } from "../../utils/constant";
import { getSourceImage } from "../../utils/handle_image_func";
import { User } from "../../type/user.type";
import { useLocation } from "react-router-dom";
// import Clock from "../../components/shared/Clock";

const { Sider, Content } = Layout;

type MenuItem = {
  key: string;
  icon: JSX.Element;
  label: string;
  link: string;
};

type RootState = {
  auth: {
    user: User;
  };
};

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

const AdminLayoutPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { role } = user || {};
  const location = useLocation();
  const menuSidebars: MenuItem[] = useMemo(() => {
    const menuItems: MenuItem[] = [];

    switch (role) {
      case "admin":
        menuItems.push(
          {
            key: "dashboards",
            icon: <DashboardOutlined />,
            label: "Bảng điều khirển",
            link: "/admin",
          },
          {
            key: "users",
            icon: <UsergroupAddOutlined />,
            label: "Người dùng",
            link: "/admin/manage-users",
          },
          {
            key: "stores",
            icon: <UsergroupAddOutlined />,
            label: "Cửa hàng",
            link: "/admin/manage-stores",
          },
          {
            key: "products",
            icon: <ProductOutlined />,
            label: "Sản phẩm",
            link: "/admin/manage-products",
          },
          {
            key: "category",
            icon: <FolderOutlined />,
            label: "Danh mục",
            link: "/admin/manage-category",
          },
          {
            key: "reports",
            icon: <FileTextOutlined />,
            label: "Báo cáo",
            link: "/admin/manage-reports",
          },
          {
            key: "reviews",
            icon: <ReadOutlined />,
            label: "Bình luận",
            link: "/admin/manage-reviews",
          },
          {
            key: "coupons",
            icon: <GiftOutlined />,
            label: "Phiếu thưởng",
            link: "/admin/manage-coupons",
          }
        );
        break;
      case "shipper":
        menuItems.push(
          {
            key: "delivery",
            icon: <UserSwitchOutlined />,
            label: "Hồ sơ bệnh án",
            link: "/profile-medical",
          },
          {
            key: "chat",
            icon: <MessageOutlined />,
            label: "Tin nhắn",
            link: "/chat",
          }
        );
        break;
      case "sales":
        menuItems.push(
          {
            key: "statistics",
            icon: <DashboardOutlined />,
            label: "Thống kê",
            link: "/statistics",
          },
          {
            key: "orders",
            icon: <ShoppingCartOutlined />,
            label: "Đơn hàng",
            link: "/orders",
          },
          {
            key: "products",
            icon: <MedicineBoxOutlined />,
            label: "Sản phẩm",
            link: "/medicine",
          },
          {
            key: "chat",
            icon: <MessageOutlined />,
            label: "Tin nhắn",
            link: "/chat",
          }
        );
        break;
      case "user":
        break;
    }

    menuItems.push({
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      link: "/logout",
    });
    return menuItems;
  }, [role]);

  const selectedMenu = useMemo((): string[] => {
    const menu = menuSidebars.find((menu) => location.pathname === menu.link);
    return menu ? [menu.key] : [];
  }, [location.pathname, menuSidebars]);

  const onClickMenu = ({ key }: { key: string }) => {
    console.log(key);
    const menu = menuSidebars.find((menu) => menu.key === key);
    if (menu) {
      navigate(menu.link);
    }
  };

  return (
    <Layout>
      <Sider
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={250}
        style={siderStyle}
        onCollapse={() => setCollapsed(!collapsed)}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Typography.Title
            level={5}
            style={{
              fontWeight: "bold",
              textAlign: "center",
              margin: 0,
              color: "white",
            }}
          >
            E-CO
          </Typography.Title>
        </div>
        <Flex
          justify="space-between"
          align="center"
          style={{ flexDirection: "column", marginBottom: 15 }}
        >
          <Flex
            style={{ marginRight: 20, flexDirection: "column" }}
            align="center"
            gap={10}
          >
            {/* <Clock collapsed={collapsed} /> */}
            <Button
              type="text"
              style={{ paddingLeft: 30, color: "white" }}
              onClick={() => navigate("/profile")}
              icon={
                user.avatar ? (
                  <img
                    style={{
                      borderRadius: "50%",
                      height: 25,
                      width: 25,
                      objectFit: "cover",
                    }}
                    src={getSourceImage(user.avatar)}
                  />
                ) : (
                  <UserOutlined />
                )
              }
            >
              {collapsed ? "" : user.username || user.phone}
            </Button>
            {!collapsed && (
              <Tag color={colorOfType[user.role]}>
                {TYPE_USER_STR[user.role]}
              </Tag>
            )}
          </Flex>
        </Flex>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedMenu}
          items={menuSidebars}
          onClick={onClickMenu}
        />
      </Sider>

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
    </Layout>
  );
};

export default AdminLayoutPage;
