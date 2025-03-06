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
  OrderedListOutlined,
  TeamOutlined,
  GlobalOutlined,
  BarChartOutlined,
  DollarCircleFilled,
  BankOutlined,
  ShopFilled,
  ProfileFilled,
  StarOutlined,
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
  icon?: JSX.Element;
  label: string;
  link: string;
  children?: MenuItem[];
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
          },
          {
            key: "orders",
            icon: <OrderedListOutlined />,
            label: "Đơn hàng",
            link: "/admin/manage-orders",
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
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Thống kê",
            link: "/store-manage/dashboard",
          },
          {
            key: "orders",
            icon: <ShoppingCartOutlined />,
            label: "Đơn hàng",
            link: "#",
            children: [
              {
                key: "all-orders",
                label: "Tất cả đơn hàng",
                link: "/store-manage/all-orders",
              },
              {
                key: "dispatched-orders",
                label: "Đơn hàng đã bàn giao",
                link: "/store-manage/dispatched-orders",
              },
              {
                key: "cancel-orders",
                label: "Đơn hàng đã hủy/hoàn tiền",
                link: "/store-manage/cancel-orders",
              },
            ],
          },
          {
            key: "products",
            icon: <MedicineBoxOutlined />,
            label: "Quản lý sản phẩm",
            link: "/store-manage/products",
          },
          {
            key: "marketing",
            icon: <GlobalOutlined />,
            label: "Kênh Marketing",
            link: "#",
            children: [
              {
                key: "campaigns",
                icon: <ShoppingCartOutlined />,
                label: "Khuyến mãi của Shop",
                link: "/store-manage/campaigns",
              },
              {
                key: "coupons",
                icon: <GiftOutlined />,
                label: "Mã giảm giá",
                link: "/store-manage/coupons",
              },
            ],
          },
          {
            key: "customers-services",
            icon: <TeamOutlined />,
            label: "Chăm sóc khách hàng",
            link: "#",
            children: [
              {
                key: "reviews",
                icon: <FileTextOutlined />,
                label: "Quản lý đánh giá",
                link: "/store-manage/reviews",
              },
              {
                key: "chat",
                icon: <MessageOutlined />,
                label: "Tin nhắn",
                link: "/store-manage/chat",
              },
            ],
          },
          {
            key: "finance",
            icon: <BarChartOutlined />,
            label: "Tài chính",
            link: "#",
            children: [
              {
                key: "revenue",
                icon: <DollarCircleFilled />,
                label: "Doanh thu",
                link: "/store-manage/revenue",
              },
              {
                key: "bankAccount",
                icon: <BankOutlined />,
                label: "Tài khoản ngân hàng",
                link: "/store-manage/bank-account",
              },
            ],
          },
          {
            key: "shop",
            icon: <ShopFilled />,
            label: "Quản lý Shop",
            link: "#",
            children: [
              {
                key: "profile",
                icon: <ProfileFilled />,
                label: "Hồ sơ Shop",
                link: "/store-manage/shop-profile",
              },
              {
                key: "decoration",
                icon: <StarOutlined />,
                label: "Trang trí Shop",
                link: "/store-manage/shop-decoration",
              },
            ],
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
    const findMenu = (menuList: MenuItem[]): MenuItem | undefined => {
      for (const menu of menuList) {
        if (location.pathname === menu.link) return menu;
        if (menu.children) {
          const found = findMenu(menu.children);
          if (found) return found;
        }
      }
    };

    const menu = findMenu(menuSidebars);
    return menu ? [menu.key] : [];
  }, [location.pathname, menuSidebars]);

  const onClickMenu = ({ key }: { key: string }) => {
    const findMenu = (menuList: MenuItem[]): MenuItem | undefined => {
      for (const menu of menuList) {
        if (menu.key === key) return menu;
        if (menu.children) {
          const found = findMenu(menu.children);
          if (found) return found;
        }
      }
    };

    const menu = findMenu(menuSidebars);
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
          items={menuSidebars.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            link: item.link,
            children: item.children?.map((subItem) => ({
              key: subItem.key,
              icon: subItem.icon,
              label: subItem.label,
              link: subItem.link,
            })),
          }))}
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
