import React, { useMemo, useState } from "react";
import { Button, Flex, Layout, Menu, Typography } from "antd";
import {
  GiftOutlined,
  NotificationFilled,
  OrderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getSourceImage } from "../../utils/handle_image_func";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
const { Sider } = Layout;

type MenuItem = {
  key: string;
  icon?: JSX.Element;
  label: string;
  link: string;
  children?: MenuItem[];
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

const UserHeader = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuSidebars: MenuItem[] = useMemo(() => {
    const menuItems: MenuItem[] = [];
    menuItems.push(
      {
        key: "notification",
        icon: <NotificationFilled />,
        label: "Thong bao",
        link: "#",
        children: [
          {
            key: "notification1",
            label: "Cap nhat don hang",
            link: "#",
          },
          {
            key: "notification2",
            label: "Khuyen mai",
            link: "#",
          },
          {
            key: "notification3",
            label: "Cap nhat",
            link: "#",
          },
        ],
      },
      {
        key: "user_account",
        icon: <UserOutlined />,
        label: "Thong tin cua tai khoan",
        link: "#",
        children: [
          {
            key: "user_profile",
            label: "Ho so",
            link: "#",
          },
          {
            key: "user_change_password",
            label: "Doi mat khau",
            link: "#",
          },
          {
            key: "user_address",
            label: "Dia chi",
            link: "#",
          },
        ],
      },
      {
        key: "my_orders",
        icon: <OrderedListOutlined />,
        label: "Don hang cua toi",
        link: "#",
      },
      {
        key: "coupons",
        icon: <GiftOutlined />,
        label: "Kho phieu thuong",
        link: "#",
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
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        theme="light"
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
            {/* {!collapsed && (
              <Tag color={colorOfType[user.role]}>
                {TYPE_USER_STR[user.role]}
              </Tag>
            )} */}
          </Flex>
        </Flex>
        <Menu
          theme="light"
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
    </>
  );
};

export default UserHeader;
