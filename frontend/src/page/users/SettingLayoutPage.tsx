import {
  BellOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
type MenuItem = {
  key: string;
  icon?: JSX.Element;
  label: string;
  link: string;
  children?: MenuItem[];
};
const SettingLayoutPage = () => {
  const navigate = useNavigate();

  const menuSidebars: MenuItem[] = useMemo(() => {
    const menuItems: MenuItem[] = [];
    menuItems.push(
      {
        key: "notification",
        icon: <BellOutlined />,
        label: "Thông báo",
        link: "/account/notifications",
      },
      {
        key: "account",
        icon: <UserOutlined />,
        label: "Tải khoản",
        link: "#",
        children: [
          {
            key: "profile",
            label: "Hồ sơ",
            link: "/account/profile",
          },
          {
            key: "change-password",
            label: "Đổi mật khẩu",
            link: "/account/change-password",
          },
          {
            key: "address",
            label: "Địa chỉ",
            link: "/account/manage-address",
          },
          {
            key: "bank",
            label: "Ngân hàng",
            link: "/account/bank",
          },
        ],
      },
      {
        key: "my-orders",
        icon: <OrderedListOutlined />,
        label: "Đơn mua",
        link: "/account/my-orders",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        link: "/account/cart",
      }
    );
    return menuItems;
  }, []);

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
      <Layout.Sider
        style={{
          backgroundColor: "transparent",
          color: "black",
          marginRight: 10,
        }}
      >
        <Menu
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
      </Layout.Sider>

      <Layout.Content>
        <Outlet />
      </Layout.Content>
    </Layout>
  );
};

export default SettingLayoutPage;
