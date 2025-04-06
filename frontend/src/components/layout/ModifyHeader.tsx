import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Dropdown, Flex, Layout, Menu, MenuProps } from "antd";
import {
  BellOutlined,
  FolderFilled,
  HomeFilled,
  MessageOutlined,
  ShopFilled,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getSourceImage } from "../../utils/handle_image_func";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Cart } from "../../type/cart.type";
import { getCart } from "../../api/cart.api";
import { Store } from "../../type/store.type";
import { getStoreByUserId } from "../../api/store.api";
import { useNotifications } from "../../hook/useNotification";
import NotificationCardM from "../notifications/Notification";
import ModifySearch from "../shared/ModifySearch";
import "./ModifyHeader.css";
const { Header } = Layout;

type MenuItem = {
  key: string;
  icon: JSX.Element;
  label: string;
  link: string;
};
const ModifyHeader: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>();
  const [store, setStore] = useState<Store>();
  const [storeLink, setStoreLink] = useState<string>("/regist-store");

  const { notifications, totalUnreadNotifications } = useNotifications();

  useEffect(() => {
    const userId = user?._id;
    if (userId) {
      const fetchStore = async () => {
        const storeData = await getStoreByUserId(userId);
        setStore(storeData);
        if (store?.isActive || storeData?.isActive) {
          setStoreLink("/store-manage/dashboard");
        }
      };
      fetchStore();
    }
  }, [user]);

  useEffect(() => {
    const fetchCart = async () => {
      if (user._id) {
        const cart = await getCart(user._id);
        setCart(cart);
      }
    };
    fetchCart();
  });
  const menuBars: MenuItem[] = useMemo(() => {
    const menuItems: MenuItem[] = [];

    menuItems.push({
      key: "home",
      icon: <HomeFilled />,
      label: "Trang chủ",
      link: "/",
    });

    menuItems.push({
      key: "category",
      icon: <FolderFilled />,
      label: "Danh mục",
      link: "/",
    });

    menuItems.push({
      key: "seller",
      icon: <ShopFilled />,
      label: "Kênh người bán",
      link: storeLink,
    });
    return menuItems;
  }, [storeLink]);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/account/profile"),
    },
    {
      key: "my-orders",
      label: "Đơn hàng của tôi",
      onClick: () => navigate("/account/my-orders"),
    },
    {
      key: "logout",
      label: "Log Out",
      onClick: () => navigate("/logout"),
    },
  ];
  const notificationMenuBar = useMemo<MenuProps["items"]>(() => {
    const menu = notifications.map((item) => ({
      key: `notification-${item._id}`,
      label: <NotificationCardM item={item} />,
      onClick: () => navigate(`${item.linkTo}`),
    }));
    menu.push({
      key: "view-all-notifications",
      label: (
        <div
          style={{ textAlign: "center", height: 30, verticalAlign: "middle" }}
        >
          <p style={{ marginTop: 10 }}>Xem tất cả thông báo</p>
        </div>
      ),
      onClick: () => navigate("/account/notifications"),
    });
    return menu;
  }, [notifications]);

  const cartMenuBar: MenuProps["items"] = useMemo(() => {
    return (
      cart?.items.flatMap((store) =>
        store.products.slice(0, 5).map((item) => {
          // Giới hạn tối đa 5 sản phẩm
          const finalPrice = item.discount
            ? item.price * (1 - item.discount)
            : item.price;

          return {
            key: `item-${item._id}`,
            label: (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Hình ảnh + tên sản phẩm */}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <img
                    src={getSourceImage(item.image || "")}
                    alt={item.productName}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 5,
                      objectFit: "cover",
                    }}
                  />
                  <span>{item.productName}</span>
                </div>

                {/* Hiển thị giá sản phẩm */}
                <div>
                  {item.discount ? (
                    <>
                      <span
                        style={{
                          textDecoration: "line-through",
                          color: "gray",
                          marginRight: 5,
                        }}
                      >
                        {item.price.toLocaleString()} đ
                      </span>
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        {finalPrice.toLocaleString()} đ
                      </span>
                    </>
                  ) : (
                    <span style={{ color: "red" }}>
                      {finalPrice.toLocaleString()} đ
                    </span>
                  )}
                </div>
              </div>
            ),
            onClick: () => navigate(`/product/${item.productId}`),
          };
        })
      ) || []
    );
  }, [cart]);

  return (
    <>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyItems: "space-between",
          padding: "35px 0",
          backgroundColor: "white",
          verticalAlign: "middle",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={menuBars}
          style={{ flex: 1, minWidth: 0, padding: 0 }}
          onClick={(e) => {
            const key = e.key;
            const item = menuBars.find((menuItem) => menuItem.key === key); // Tìm menu item theo key
            if (item) {
              navigate(item.link); // Điều hướng khi click vào menu
            }
          }}
        />
        <ModifySearch />
        <Flex
          justify="space-between"
          align="center"
          style={{ backgroundColor: "white" }}
        >
          <Flex>
            <Dropdown menu={{ items: cartMenuBar }} trigger={["hover"]}>
              <Button
                type="text"
                onClick={() => navigate("/cart")}
                style={{ color: "black" }}
              >
                <Badge
                  count={
                    <span style={{ fontSize: 15 }}>
                      {cart?.items?.reduce(
                        (total, item) => total + (item.products?.length || 0),
                        0
                      )}
                    </span>
                  }
                  offset={[0, 5]}
                  style={{
                    color: "white",
                    background: "red",
                    borderRadius: "10px",
                    width: "15px",
                    height: "15px",
                  }}
                >
                  <ShoppingCartOutlined
                    style={{ fontSize: 30, color: "black" }}
                  />
                </Badge>
              </Button>
            </Dropdown>

            <Dropdown
              menu={{
                items: notificationMenuBar,
                style: {
                  maxHeight: "500px",
                  overflowY: "auto",
                  padding: 0,
                  margin: 0,
                },
              }}
              trigger={["hover"]}
            >
              <Button
                type="text"
                style={{ color: "black" }}
                onClick={() => navigate("/account/notifications")}
              >
                <Badge
                  count={
                    <span style={{ fontSize: 15 }}>
                      {totalUnreadNotifications}
                    </span>
                  }
                  offset={[0, 5]}
                  style={{
                    color: "white",
                    background: "red",
                    borderRadius: "10px",
                    width: "15px",
                    height: "15px",
                  }}
                >
                  <BellOutlined style={{ fontSize: 30, color: "black" }} />
                </Badge>
              </Button>
            </Dropdown>

            <Button
              onClick={() => navigate("/chat")}
              style={{ color: "black", border: "none" }}
            >
              {" "}
              <Badge
                offset={[0, 5]}
                style={{
                  color: "white",
                  background: "red",
                  borderRadius: "10px",
                  width: "15px",
                  height: "15px",
                }}
              >
                <MessageOutlined style={{ fontSize: 30, color: "black" }} />
              </Badge>
            </Button>

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
        </Flex>
      </Header>
    </>
  );
};

export default ModifyHeader;
