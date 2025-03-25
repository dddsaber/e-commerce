import {
  Button,
  Card,
  Col,
  Image,
  Input,
  message,
  Row,
  Select,
  Table,
} from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../../../redux/store";
import { OrderDetails } from "../../../type/order.type";
import { getPayments } from "../../../api/payment.api";
import { ShopFilled } from "@ant-design/icons";
import { CartItem } from "../../../type/cart.type";
import { getSourceImage } from "../../../utils/handle_image_func";
import { createOrder } from "../../../api/order.api";
import { removeCartItem } from "../../../api/cart.api";
import LoadingModal from "../../../components/layout/LoadingModal";

interface paymentOptions {
  value?: string;
  label?: string;
}

const CreateOrdersPage = () => {
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const selectedProducts = location.state || [];

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [payments, setPayments] = useState<paymentOptions[]>();
  const [selectedPayment, setSelectedPayment] = useState<paymentOptions>();
  const handleSubmit = async () => {
    if (!user.address) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ của bạn!");
      navigate("/account/manage-address");
      return;
    }
    const orders = selectedProducts.map(
      (store: { storeId: string; products: OrderDetails[] }) => ({
        storeId: store.storeId,
        userId: user._id, // ID người dùng đặt hàng
        customerNote: notes[store.storeId] ?? undefined,
        address: user.address,
        paymentId: selectedPayment,
        orderDetails: store.products.map((product: OrderDetails) => ({
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
          discount: product.discount,
        })),
      })
    );
    try {
      setLoading(true);
      for (const order of orders) {
        const result = await createOrder(order);
        if (!result) {
          message.error(`Don hang tu cua hang ${order.storeId} bi loi`);
        } else {
          for (const cartItem of order.orderDetails) {
            await removeCartItem(user._id, cartItem.productId);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      navigate("/success-create-order");
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await getPayments({});
      setPayments(
        data.payments.map((payment) => ({
          value: payment._id,
          label: payment.name,
        }))
      );
    };
    fetchPayments();
  }, []);

  const columns = () => [
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
      render: (price: number, record: CartItem) => {
        const discountedPrice = record.discount
          ? price * (1 - record.discount) // Tính giá sau khi giảm
          : price;

        return (
          <div>
            {record.discount ? (
              <>
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "gray",
                    marginRight: "8px",
                  }}
                >
                  {price.toLocaleString()} đ
                </span>
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {discountedPrice.toLocaleString()} đ
                </span>
              </>
            ) : (
              <span>{price.toLocaleString()} đ</span>
            )}
          </div>
        );
      },
    },

    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (quantity: number) => <span>{quantity.toLocaleString()} </span>,
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
  ];

  const calculateTotalPrice = (products: CartItem[]) => {
    return products.reduce((total, product) => {
      return (
        total + product.price * product.quantity * (1 - (product.discount ?? 0))
      );
    }, 0);
  };

  return (
    <>
      <LoadingModal isModalOpen={loading} setIsModalOpen={setLoading} />
      <Row gutter={[12, 12]}>
        <Col span={18} style={{}}>
          {selectedProducts.map(
            (store: {
              storeId: string;
              storeName: string;
              products: CartItem[];
            }) => (
              <>
                <Card
                  title={
                    <>
                      <ShopFilled />
                      &nbsp;
                      {store.storeName}
                    </>
                  }
                  style={{
                    marginBottom: "20px",
                  }}
                  key={store.storeId}
                >
                  <Table
                    dataSource={store.products}
                    columns={columns()}
                    rowKey="productId"
                    pagination={false}
                  />
                  <Row gutter={[12, 12]} style={{ marginTop: 15 }}>
                    <Col span={2}>
                      <label>Ghi chú:</label>
                    </Col>
                    <Col span={10}>
                      <Input
                        type="text"
                        value={notes[store.storeId] ?? ""}
                        onChange={(e) =>
                          setNotes({
                            ...notes,
                            [store.storeId]: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col span={12}></Col>
                  </Row>

                  {/* Hiển thị tổng tiền */}
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    Tổng tiền:{" "}
                    <span style={{ color: "red" }}>
                      {calculateTotalPrice(store.products).toLocaleString()} đ
                    </span>
                  </div>
                </Card>
              </>
            )
          )}
        </Col>
        <Col
          span={6}
          style={{
            textAlign: "center",
          }}
        >
          <Card title="Tạo đơn hàng">
            <Select
              options={payments}
              value={selectedPayment}
              style={{ width: "100%", margin: "10px 0" }}
              onChange={(value) => setSelectedPayment(value)}
            />
            <Button onClick={handleSubmit}>Tạo đơn hàng</Button>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateOrdersPage;
