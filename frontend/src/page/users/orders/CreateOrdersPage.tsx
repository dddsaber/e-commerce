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
import { getDeliveryDetails } from "../../../api/delivery.api";
import { Coupon } from "../../../type/coupon.type";
import { getValidCoupons } from "../../../api/coupon.api";

interface paymentOptions {
  value?: string;
  label?: string;
}

interface DeliveryDetails {
  distance: number;
  shippingFee: number;
  estimatedDate: string;
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
  const [deliveryDetails, setDeliveryDetails] = useState<
    Record<string, DeliveryDetails>
  >({});

  const [storeCoupons, setStoreCoupons] = useState<Record<string, Coupon[]>>(
    {}
  );
  const [selectedStoreCoupon, setSelectedStoreCoupon] = useState<
    Record<string, Coupon>
  >({});

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      const coupons: Record<string, Coupon[]> = {};
      for (const store of selectedProducts) {
        try {
          const data = await getValidCoupons(store.storeId);
          coupons[store.storeId] = data.coupons; // Lưu thông tin coupon theo storeId
        } catch (error) {
          console.error(`Loi lấy mã coupon cho ${store.storeId}`, error);
        }
      }
      setLoading(false);
      setStoreCoupons(coupons); // Cập nhật state với dữ liệu đúng kiểu
    };
    fetchCoupons();
  }, selectedProducts);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      setLoading(true);

      const details: Record<string, DeliveryDetails> = {};
      for (const store of selectedProducts) {
        if (!user.address) {
          return;
        }
        try {
          const data = await getDeliveryDetails(
            user?.address,
            store.storeAddress
          );
          details[store.storeId] = data; // Lưu thông tin delivery theo storeId
        } catch (error) {
          console.error(
            `Lỗi lấy thông tin giao hàng cho ${store.storeId}`,
            error
          );
        }
      }
      setLoading(false);
      setDeliveryDetails(details); // Cập nhật state với dữ liệu đúng kiểu
    };

    if (selectedProducts.length > 0) {
      fetchDeliveryDetails();
    }
  }, [selectedProducts, user.address]);

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
        couponId: selectedStoreCoupon[store.storeId] || undefined,
        shippingFee: deliveryDetails[store.storeId].shippingFee,
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
                  {price.toLocaleString("vi-VN")} đ
                </span>
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {discountedPrice.toLocaleString("vi-VN")} đ
                </span>
              </>
            ) : (
              <span>{price.toLocaleString("vi-VN")} đ</span>
            )}
          </div>
        );
      },
    },

    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (quantity: number) => (
        <span>{quantity.toLocaleString("vi-VN")} </span>
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
          ).toLocaleString("vi-VN")}{" "}
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

  const calculateFinalPrice = (store: {
    storeId: string;
    products: CartItem[];
  }) => {
    const totalProductPrice = calculateTotalPrice(store.products);
    const shippingFee = deliveryDetails[store.storeId]?.shippingFee || 0;
    const coupon = selectedStoreCoupon[store.storeId];

    let discount = 0;
    if (coupon) {
      discount =
        coupon.type === "fixed"
          ? coupon.value
          : (totalProductPrice * coupon.value) / 100;
    }

    return (
      (discount < totalProductPrice ? totalProductPrice - discount : 0) +
      shippingFee
    );
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
                    <Col span={16}></Col>
                    <Col span={4}>
                      <label>Tổng sản phẩm:</label>
                    </Col>
                    <Col span={4}>
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        {calculateTotalPrice(store.products).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        đ
                      </span>
                    </Col>

                    <Col span={16}></Col>
                    <Col span={4}>
                      <label>Giảm giá:</label>
                    </Col>
                    <Col span={4}>
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        {selectedStoreCoupon[store.storeId]
                          ? selectedStoreCoupon[store.storeId].type === "fixed"
                            ? `-${selectedStoreCoupon[
                                store.storeId
                              ].value.toLocaleString("vi-VN")} đ`
                            : `-${(
                                calculateTotalPrice(store.products) *
                                (selectedStoreCoupon[store.storeId].value / 100)
                              ).toLocaleString("vi-VN")} đ`
                          : "0 đ"}
                      </span>
                    </Col>

                    <Col span={16}></Col>
                    <Col span={4}>
                      <label>Phí vận chuyển:</label>
                    </Col>
                    <Col span={4}>
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        {deliveryDetails[store.storeId]?.shippingFee !==
                        undefined
                          ? `${deliveryDetails[
                              store.storeId
                            ].shippingFee.toLocaleString("vi-VN")} đ`
                          : "Đang tính..."}
                      </span>
                    </Col>
                    <Col span={16}></Col>
                    <Col span={4}>
                      <label>Tổng tiền:</label>
                    </Col>
                    <Col span={4}>
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          textAlign: "right",
                        }}
                      >
                        {calculateFinalPrice(store).toLocaleString("vi-VN")} đ
                      </span>
                    </Col>
                    <Col span={3}>
                      <label>Phiếu thưởng: </label>
                    </Col>
                    <Col span={13}>
                      <Select
                        value={selectedStoreCoupon[store.storeId]?._id} // Hiển thị ID của coupon được chọn
                        style={{ width: "100%", margin: "10px 0" }}
                        onChange={(value) => {
                          const coupon = storeCoupons[store.storeId]?.find(
                            (coupon) => coupon._id === value
                          );
                          if (!coupon) return;
                          setSelectedStoreCoupon({
                            ...selectedStoreCoupon,
                            [store.storeId]: coupon,
                          });
                        }}
                        placeholder="Chọn mã giảm giá"
                      >
                        {storeCoupons[store.storeId]?.map((coupon) => (
                          <Select.Option key={coupon._id} value={coupon._id}>
                            {`${coupon.name} - ${
                              coupon.type === "fixed"
                                ? coupon.value
                                : coupon.value + " %"
                            }`}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={8}></Col>
                    <Col span={3}>
                      <label>Ghi chú:</label>
                    </Col>
                    <Col span={13}>
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
                    <Col span={8}></Col>
                  </Row>
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
