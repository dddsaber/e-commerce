import React from "react";
import { Product } from "../../type/product.type";
import { Button, Card, message } from "antd";
import { Link } from "react-router-dom";
import { getSourceImage } from "../../utils/handle_image_func";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { addCartItem } from "../../api/cart.api";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const addCart = async (product: Product, quantity: number) => {
    const response = await addCartItem(user._id, product._id, quantity);
    if (response) {
      message.success(`${quantity} ${product.name} added to cart!`);
    }
  };
  return (
    <Card
      style={{
        textAlign: "center",
        paddingTop: "15px",
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      hoverable
      cover={
        <Link to={`/product/${product._id}`}>
          <img
            style={{
              width: "100%",
              maxWidth: 160,
              margin: "0 auto",
              display: "block",
            }}
            alt={product.name}
            src={getSourceImage(product.image || "")}
          />
        </Link>
      }
    >
      <Card.Meta
        title={product.name}
        description={
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {product.discount && product.discount !== 0 ? (
              <>
                <span style={{ color: "#b4182d", fontWeight: "bold" }}>
                  {(product.price * (1 - product.discount)).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  đ&nbsp;
                  <span
                    style={{
                      backgroundColor: "#b4182d",
                      color: "#fff",
                      padding: "0 4px",
                      borderRadius: 2,
                      marginLeft: 4,
                      fontSize: 12,
                    }}
                  >
                    -{product.discount * 100}%
                  </span>
                </span>
                <span style={{ fontSize: 10, color: "#000" }}>
                  Đã bán: {product.inventory?.soldQuantity ?? 0}
                </span>
              </>
            ) : (
              <>
                <span style={{ color: "#b4182d", fontWeight: "bold" }}>
                  {product.price.toLocaleString("vi-VN")} đ
                </span>
                <span style={{ fontSize: 10, color: "#000" }}>
                  Đã bán: {product.inventory?.soldQuantity ?? 0}
                </span>
              </>
            )}
          </div>
        }
      />
      <Button
        type="primary"
        style={{ marginTop: "10px" }}
        onClick={() => {
          addCart(product, 1);
        }}
      >
        Thêm vào giỏ
      </Button>
    </Card>
  );
};

export default ProductCard;
