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
      style={{ textAlign: "center", paddingTop: "15px" }}
      hoverable
      cover={
        <Link to={`/product/${product._id}`}>
          <img
            style={{ width: 160, margin: 3 }}
            alt={product.name}
            src={getSourceImage(product.image || "")}
          />
        </Link>
      }
    >
      <Card.Meta
        title={product.name}
        description={
          product.discount && product.discount !== 0 ? (
            <>
              <span style={{ color: "#b4182d", fontWeight: "bold" }}>
                {(product.price * (1 - product.discount)).toLocaleString()}{" "}
                đ&nbsp;&nbsp;
                <span style={{ backgroundColor: "#b4182d", color: "#fff" }}>
                  - {product.discount * 100} %
                </span>
                <br />
              </span>
              <del
                style={{
                  marginLeft: "10px",
                  color: "gray",
                }}
              >
                {product.price.toLocaleString()} đ
              </del>
            </>
          ) : (
            <span style={{ color: "#b4182d", fontWeight: "bold" }}>
              {product.price.toLocaleString()} đ <br /> <br />
            </span>
          )
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
