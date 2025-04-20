import React, { useEffect, useState } from "react";
import { Cart, CartItem } from "../../../type/cart.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getCart, removeCartItem, updateCartItem } from "../../../api/cart.api";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Image,
  InputNumber,
  Row,
  Table,
  Typography,
} from "antd";
import { getSourceImage } from "../../../utils/handle_image_func";
import { useNavigate } from "react-router-dom";
const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [cart, setCart] = useState<Cart | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>(
    {}
  );
  const [reload, setReload] = useState<boolean>(false);
  useEffect(() => {
    const fetchCart = async () => {
      if (user._id) {
        const cartData = await getCart(user._id);
        setCart(cartData);
      }
    };
    fetchCart();
  }, [user, reload]);

  const handleRemoveItem = async (productId: string, storeId: string) => {
    await removeCartItem(user._id, productId);

    // Cập nhật lại state giỏ hàng
    setCart((prevCart) => {
      if (!prevCart) return prevCart;

      const updatedItems = prevCart.items.map((store) => {
        if (store.storeId === storeId) {
          return {
            ...store,
            products: store.products.filter((p) => p.productId !== productId),
          };
        }
        return store;
      });

      return {
        ...prevCart,
        items: updatedItems.filter((store) => store.products.length > 0), // Xóa store trống
      };
    });

    // Cập nhật lại checkedItems để tránh lỗi checkbox
    setCheckedItems((prev) => ({
      ...prev,
      [storeId]: prev[storeId]?.filter((id) => id !== productId) || [],
    }));
  };

  const handleNavigateOrder = () => {
    const selectedProducts = cart?.items
      .map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        storeAddress: store.storeAddress,
        products: store.products.filter((product) =>
          checkedItems[store.storeId]?.includes(product.productId)
        ),
      }))
      .filter((store) => store.products.length > 0); // Lọc bỏ store không có sản phẩm nào được chọn
    console.log(selectedProducts);
    navigate("/create-orders", { state: selectedProducts });
  };

  const handleCheck = (storeId: string, productId: string) => {
    setCheckedItems((prev) => {
      const newChecked = { ...prev };
      if (!newChecked[storeId]) newChecked[storeId] = [];

      newChecked[storeId] = newChecked[storeId].includes(productId)
        ? newChecked[storeId].filter((id) => id !== productId)
        : [...newChecked[storeId], productId];

      return newChecked;
    });
  };

  const isAllChecked =
    cart?.items.every((store) =>
      store.products.every((p) =>
        checkedItems[store.storeId]?.includes(p.productId)
      )
    ) ?? false;

  // Hàm chọn tất cả sản phẩm
  const handleCheckAll = (checked: boolean) => {
    const newCheckedItems: Record<string, string[]> = {};
    cart?.items.forEach((store) => {
      newCheckedItems[store.storeId] = checked
        ? store.products.map((p) => p.productId)
        : [];
    });
    setCheckedItems(newCheckedItems);
  };

  const handleSelectAll = (storeId: string, checked: boolean) => {
    setCheckedItems((prev) => ({
      ...prev,
      [storeId]: checked
        ? cart?.items
            .find((s) => s.storeId === storeId)
            ?.products.map((p) => p.productId) || []
        : [],
    }));
  };

  const columns = (storeId: string) => [
    {
      title: (
        <Checkbox
          onChange={(e) => handleSelectAll(storeId, e.target.checked)}
          checked={
            cart?.items
              .find((s) => s.storeId === storeId)
              ?.products.every((p) =>
                checkedItems[storeId]?.includes(p.productId)
              ) ?? false
          }
        />
      ),
      dataIndex: "checked",
      render: (_: unknown, record: CartItem) => (
        <Checkbox
          checked={checkedItems[storeId]?.includes(record.productId)}
          onChange={() => handleCheck(storeId, record.productId)}
        />
      ),
    },
    {
      title: "Sản phẩm",
      render: (_: unknown, record: CartItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image
            width={80}
            src={getSourceImage(record.image || "")}
            alt={record.productName || ""}
          />
          <p>{record.productName}</p>
        </div>
      ),
    },

    {
      title: "Giá",
      dataIndex: "price",
      render: (price: number) => <span>{price.toLocaleString()} đ</span>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => {
            updateCartItem(user._id, record.productId, value ?? 0);
            setReload(!reload);
          }}
        />
      ),
    },

    {
      title: "Thành tiền",
      render: (_: unknown, record: CartItem) => (
        <span style={{ color: "red" }}>
          {(
            record.price *
            record.quantity *
            (1 - (record.discount ?? 0))
          ).toLocaleString()}{" "}
          đ
        </span>
      ),
    },
    {
      title: "",
      render: (_: unknown, record: CartItem) => (
        <Button onClick={() => handleRemoveItem(record.productId, storeId)}>
          Xóa
        </Button>
      ),
    },
  ];
  // Tính tổng tiền của sản phẩm đã chọn
  const totalPrice =
    cart?.items.reduce((sum, store) => {
      return (
        sum +
        store.products.reduce((storeSum, product) => {
          return checkedItems[store.storeId]?.includes(product.productId)
            ? storeSum + product.price * product.quantity
            : storeSum;
        }, 0)
      );
    }, 0) ?? 0;
  return (
    <>
      <h2>Giỏ hàng của bạn</h2>
      {/* Thanh chọn tất cả và thông tin tổng */}
      <Card style={{ marginBottom: 20, padding: 10, background: "#fff" }}>
        <Row align="middle" justify="space-between">
          <Col span={6}>
            <Checkbox
              onChange={(e) => handleCheckAll(e.target.checked)}
              checked={isAllChecked}
            >
              Chọn tất cả
            </Checkbox>
          </Col>
          <Col span={6}>
            <Typography.Text strong>
              Số sản phẩm đã chọn: {Object.values(checkedItems).flat().length}
            </Typography.Text>
          </Col>
          <Col span={6}>
            <Typography.Text strong>
              Tổng tiền: {totalPrice.toLocaleString()} đ
            </Typography.Text>
          </Col>
          <Col span={6}>
            <Button
              type="primary"
              disabled={totalPrice === 0}
              onClick={handleNavigateOrder}
            >
              Thanh toán
            </Button>
          </Col>
        </Row>
      </Card>
      {cart?.items.map((store) => (
        <>
          <Card
            title={
              <Row align="middle" gutter={[8, 8]} wrap>
                {/* Avatar hoặc logo */}
                <Col
                  xs={4}
                  sm={2}
                  md={1}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Avatar
                    style={{
                      width: 35,
                      height: 35,
                      cursor: "pointer",
                    }}
                    src={getSourceImage(store.logo)}
                    alt={store.storeName || ""}
                    onClick={() => navigate(`/store/${store.storeId}`)}
                  />
                </Col>

                {/* Tên cửa hàng */}
                <Col
                  xs={20}
                  sm={22}
                  md={23}
                  style={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/store/${store.storeId}`)}
                >
                  <Typography.Title
                    level={5}
                    style={{
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {store.storeName}
                  </Typography.Title>
                </Col>
              </Row>
            }
            key={store.storeId}
            style={{ marginBottom: 20 }}
          >
            <Table
              dataSource={store.products}
              columns={columns(store.storeId)}
              rowKey="productId"
              pagination={false}
              scroll={{ x: "100%" }} // 👈 giúp Table responsive nếu có nhiều cột
            />
          </Card>
        </>
      ))}
    </>
  );
};

export default CartPage;
