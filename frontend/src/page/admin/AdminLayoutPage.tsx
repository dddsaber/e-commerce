import {
  DashboardOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
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
  ShopOutlined,
  TruckFilled,
  HistoryOutlined,
} from "@ant-design/icons";
import { Button, Flex, Image, Layout, Menu, Tag, theme, Grid } from "antd";
const { useBreakpoint } = Grid;
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { colorOfType, TYPE_USER, TYPE_USER_STR } from "../../utils/constant";
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

import icon_img from "../../assets/icon.png";

const AdminLayoutPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const user = useSelector((state: RootState) => state.auth.user);
  const { role } = user || {};
  const location = useLocation();
  const menuSidebars: MenuItem[] = useMemo(() => {
    const menuItems: MenuItem[] = [];

    switch (role) {
      case TYPE_USER.admin:
        menuItems.push(
          {
            key: "dashboards",
            icon: <DashboardOutlined />,
            label: "Bảng điều khirển",
            link: "/admin",
          },
          {
            key: "chats",
            icon: <MessageOutlined />,
            label: "Tin nhắn",
            link: "/admin/chat",
          },
          {
            key: "users",
            icon: <UsergroupAddOutlined />,
            label: "Người dùng",
            link: "/admin/manage-users",
          },
          {
            key: "stores",
            icon: <ShopOutlined />,
            label: "Cửa hàng",
            link: "#",
            children: [
              {
                key: "store-info",
                label: "Thông tin",
                link: "/admin/manage-stores",
              },
              {
                key: "stores-revenue",
                label: "Doanh thu ",
                link: "/admin/stores-revenue",
              },
            ],
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
      case TYPE_USER.shipper:
        menuItems.push({
          key: "chat",
          icon: <MessageOutlined />,
          label: "Tin nhắn",
          link: "/chat",
        });
        break;

      case TYPE_USER.sales:
        menuItems.push(
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Thống kê",
            link: "/store-manage",
          },
          {
            key: "chats",
            icon: <MessageOutlined />,
            label: "Tin nhắn",
            link: "/store-manage/chat",
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
                key: "pending-orders",
                label: "Đơn hàng chờ xử lý",
                link: "/store-manage/pending-orders",
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
                key: "store-chat",
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
              {
                key: "payoutHistory",
                icon: <HistoryOutlined />,
                label: "Lịch sử kết toán",
                link: "/store-manage/payout-history",
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
                label: "Hồ sơ Shop",
                link: "/store-manage/shop-profile",
              },
              {
                key: "address",
                label: "Địa chỉ lấy hàng",
                link: "/store-manage/shop-address",
              },
              {
                key: "decoration",
                label: "Trang trí Shop",
                link: "/store-manage/shop-decoration",
              },
            ],
          }
        );
        break;
      case TYPE_USER.logistic_provider:
        menuItems.push({
          key: "delivery-manage",
          icon: <TruckFilled />,
          label: "Quản lý đơn vận chuyển",
          link: "#",
          children: [
            {
              key: "all-deliveries",
              label: "Tất cả",
              link: "/delivery/all-deliveries",
            },
            {
              key: "await-pickup-deliveries",
              label: "Chờ lấy hàng",
              link: "/delivery/await-pickup-deliveries",
            },
            {
              key: "on-transit-deliveries",
              label: "Đang vận chuyển",
              link: "/delivery/on-transit-deliveries",
            },
            {
              key: "cancel-deliveries",
              label: "Đơn vận chuyển thất bại",
              link: "/delivery/failed-deliveries",
            },
          ],
        });
        break;
      case TYPE_USER.user:
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
    <Layout style={{ flex: 1, flexDirection: "row" }}>
      {!isMobile ? (
        <Sider
          collapsible
          collapsed={collapsed}
          theme="dark"
          width={240}
          style={{
            overflowY: "auto",
            maxHeight: isMobile ? "auto" : "94vh",
            position: isMobile ? "relative" : "sticky",

            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            scrollbarWidth: "thin",
            scrollbarGutter: "stable",
          }}
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
            <Image
              src={icon_img}
              style={{
                height: "50px",
                cursor: "pointer",
                margin: "5px 0",
                borderRadius: "25px",
              }}
              preview={false}
              onClick={() => navigate("/")}
            />
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
                onClick={() => navigate("/account/profile")}
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
      ) : (
        <Layout.Header
          style={{
            background: "#001529",
            padding: "0 16px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Image
            src={icon_img}
            preview={false}
            height={40}
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={selectedMenu}
            items={menuSidebars.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              children: item.children?.map((subItem) => ({
                key: subItem.key,
                icon: subItem.icon,
                label: subItem.label,
              })),
            }))}
            onClick={onClickMenu}
          />
        </Layout.Header>
      )}
      <Content
        style={{
          margin: 0,
          minHeight: "100vh",
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          backgroundColor: "#eaeaea",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AdminLayoutPage;
