import React, { useEffect, useState } from "react";
import { Cart, CartItem } from "../../../type/cart.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getCart, removeCartItem, updateCartItem } from "../../../api/cart.api";
import {
  Button,
  Card,
  Checkbox,
  CheckboxChangeEvent,
  Col,
  Image,
  InputNumber,
  Layout,
  Row,
  Table,
  TableColumnsType,
} from "antd";
import { getSourceImage } from "../../../utils/handle_image_func";

const CartPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [cart, setCart] = useState<Cart>();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      const cart = await getCart(user._id);
      setCart(cart);
    };
    fetchCart();
  });

  // Hàm xử lý thay đổi số lượng
  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 0) {
      updateCartItem(user._id, productId, quantity);
    }
  };

  // Hàm tính tổng tiền của sản phẩm
  const calculateTotal = (item: CartItem) => {
    return item.price * item.quantity * (1 - (item.discount ?? 0));
  };

  // Hàm xử lý chọn/bỏ chọn sản phẩm
  const handleCheck = (productId: string) => {
    setCheckedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((item) => item !== productId)
        : [...prev, productId]
    );
  };

  // Hàm xử lý chọn tất cả
  const handleSelectAll = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setCheckedItems(cart!.items.map((item) => item._id));
    } else {
      setCheckedItems([]);
    }
  };

  // Hàm xử lý xóa sản phẩm
  const handleRemove = (productId: string) => {
    removeCartItem(user._id, productId);
  };

  // Hàm tính tổng tiền cho các sản phẩm được chọn
  const calculateSelectedTotal = () => {
    return checkedItems.reduce((acc, id) => {
      const item = cart?.items.find((item) => item._id === id);
      return acc + (item ? calculateTotal(item) : 0);
    }, 0);
  };

  // Cấu hình các cột cho bảng giỏ hàng
  const columns: TableColumnsType<CartItem> = [
    {
      title: (
        <Checkbox
          onChange={handleSelectAll}
          checked={checkedItems.length === cart?.items.length}
        />
      ),
      dataIndex: "checked",
      render: (checked: unknown, record: CartItem) => (
        <Checkbox
          checked={checkedItems.includes(record.productId)}
          onChange={() => handleCheck(record.productId)}
        />
      ),
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_: unknown, record: CartItem) => (
        <div>
          <Image
            width={80}
            src={getSourceImage(record.image || "")}
            alt={record.productName || ""}
          />
        </div>
      ),
    },
    {
      title: "",
      render: (_: unknown, record: CartItem) => (
        <div>
          <p>{record.productName}</p>
          <span>{record.price}</span>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      width: 180,
      render: (price: number, record: CartItem) => {
        // Kiểm tra xem có discount không
        const discountPrice = record.discount
          ? price - price * record.discount
          : null;

        return (
          <span>
            {discountPrice ? (
              <>
                <span
                  style={{ textDecoration: "line-through", marginRight: "8px" }}
                >
                  {price.toLocaleString()} đ
                </span>
                <span style={{ color: "red" }}>
                  {discountPrice.toLocaleString()} đ
                </span>
              </>
            ) : (
              <span>{price.toLocaleString()} đ</span>
            )}
          </span>
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) =>
            handleQuantityChange(record.productId, value ?? 0)
          }
        />
      ),
    },
    {
      title: "Thành tiền",
      render: (_: unknown, record: CartItem) => (
        <span>{calculateTotal(record).toLocaleString()} đ</span>
      ),
    },
    {
      title: "",
      render: (_: unknown, record: CartItem) => (
        <Button danger onClick={() => handleRemove(record.productId)}>
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ padding: "20px", minHeight: "100vh" }}>
      <h2>Giỏ hàng của bạn</h2>
      <Row gutter={[12, 12]}>
        <Col span={16}>
          <Table
            style={{ marginTop: "20px" }}
            dataSource={cart?.items}
            columns={columns}
            rowKey={(record: CartItem) => {
              return record._id;
            }}
            pagination={false}
          />
        </Col>
        <Col span={8}>
          <Card
            title={"Thanh toán"}
            style={{ marginTop: "20px", textAlign: "left" }}
            headStyle={{
              color: "#fff",
              fontWeight: "bold",
              background: "#29104a",
            }}
          >
            <h3>Tổng tiền: {calculateSelectedTotal().toLocaleString()} đ</h3>

            {checkedItems.length > 0 ? (
              <ul>
                {cart?.items
                  .filter((item) => checkedItems.includes(item._id))
                  .map((item) => (
                    <li key={item._id}>
                      {item.productName} {`(${item.quantity})`}-
                      {calculateTotal(item).toLocaleString()} đ
                    </li>
                  ))}
              </ul>
            ) : (
              <p>Chưa chọn sản phẩm nào</p>
            )}

            <Button
              type="primary"
              size="large"
              disabled={checkedItems.length === 0}
            >
              Tiến hành thanh toán
            </Button>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default CartPage;
