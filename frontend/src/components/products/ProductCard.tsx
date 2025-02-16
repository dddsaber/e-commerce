import React from "react";
import { Product } from "../../type/product.type";
import { Button, Card, notification } from "antd";
import { Link } from "react-router-dom";
import { getSourceImage } from "../../utils/handle_image_func";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addCard = async (product: Product, quantity: number) => {
    notification.success({
      message: "Thêm sản phẩm vào gi�� hàng",
      description: `${quantity} ${product} added to cart!`,
    });
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
        onClick={(e) => {
          e.preventDefault();
          addCard(product, 1);
        }}
      >
        Thêm vào giỏ
      </Button>
    </Card>
  );
};

export default ProductCard;
