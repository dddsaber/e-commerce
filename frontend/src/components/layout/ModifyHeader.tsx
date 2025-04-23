import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Dropdown,
  Flex,
  Image,
  Layout,
  MenuProps,
  Space,
} from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  MessageOutlined,
  OrderedListOutlined,
  ProfileFilled,
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
import icon_img from "../../assets/icon.jpg";
import { TYPE_USER } from "../../utils/constant";

const { Header } = Layout;

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
          setStoreLink("/store-manage");
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

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <ProfileFilled />,
      label: "Hồ sơ",
      onClick: () => navigate("/account/profile"),
    },
    {
      key: "my-orders",
      icon: <OrderedListOutlined />,
      label: "Đơn mua",
      onClick: () => navigate("/account/my-orders"),
    },
    {
      key: "store",
      icon: <ShopFilled />,
      label: "Kênh người bán",
      onClick: () => navigate(`${storeLink}`),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: () => navigate("/logout"),
    },
  ];
  const notificationMenuBar = useMemo<MenuProps["items"]>(() => {
    const menu = notifications.map((item) => ({
      key: `notification-${item._id}`,
      label: <NotificationCardM item={item} />,
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
          padding: "20px 40px",
          backgroundColor: "white",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Flex
          justify="space-between"
          style={{ width: "60%", alignItems: "center" }}
        >
          <Image
            src={icon_img}
            style={{ height: "60px", cursor: "pointer", margin: "0 10px" }}
            preview={false}
            onClick={() => navigate("/")}
          />
          <Space style={{ width: "20%" }} />
          <ModifySearch />
        </Flex>

        {user._id ? (
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
                onClick={() => {
                  if (user.role === TYPE_USER.admin) {
                    navigate("/admin/chat");
                  } else if (user.role === TYPE_USER.sales) {
                    navigate("/store-manage/chat");
                  } else navigate("/chat");
                }}
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
        ) : (
          <></>
        )}
      </Header>
    </>
  );
};

export default ModifyHeader;
