import React from "react";
import { CustomProductList } from "../../type/custom_product_list.type";
import { Card, Image } from "antd";
import ProductHero from "../products/ProductHero";
import { getSourceImage } from "../../utils/handle_image_func";

interface CustomListProps {
  customlist: CustomProductList;
}

const CustomList: React.FC<CustomListProps> = ({ customlist }) => {
  return (
    <div style={{ marginTop: 20, marginBottom: 10 }}>
      <Card
        title={customlist.name}
        style={{
          marginBottom: 12,
          backgroundColor: "transparent",
          boxShadow: "none",
          border: "none",
        }}
        styles={{
          header: {
            textAlign: "center",
            fontSize: 25,
            textTransform: "capitalize",
            backgroundColor: "white",
          },
          body: {
            backgroundColor: "red",
            height: 1,
            padding: 0, // đảm bảo không có padding làm cao hơn 1px
          },
        }}
      >
        {/* Không có nội dung bên trong nên body chỉ hiển thị 1px chiều cao màu đỏ */}
      </Card>
      {customlist.image ? (
        <Image
          src={getSourceImage(customlist.image)}
          style={{ marginBottom: 10 }}
          preview={false}
        />
      ) : (
        <></>
      )}
      <ProductHero products={customlist.products} key={customlist._id} />
    </div>
  );
};

export default CustomList;
