import React, { useEffect, useState } from "react";
import { Category } from "../../type/category.type";
import { getSelectCategories } from "../../api/category.api";
import { Avatar, Card, Col, Row, Spin } from "antd";
import react_icon from "../../assets/react_icon.jpg";
const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await getSelectCategories();
        setCategories(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderCategories = () => {
    const categoryElements = [];
    for (let i = 0; i < 16; i++) {
      categoryElements.push(
        <Col span={3} key={i}>
          <Card
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              aspectRatio: 1,
              backgroundColor: "white",
              cursor: "pointer",
            }}
            hoverable
          >
            <Avatar src={react_icon} style={{ width: 50, height: 50 }} />
            <br />
            <span key={i}>{`Category ${i + 1}`}</span>
          </Card>
        </Col>
      );
    }
    return categoryElements;
  };

  return loading === false ? (
    <Card
      title="Danh mục"
      style={{
        padding: 0,
        marginTop: 10,
        marginBottom: 40,
      }}
      styles={{
        body: {
          padding: 0,
        },
        header: {
          fontSize: 25,
          textAlign: "center",
          color: "e5e5e5",
          textTransform: "uppercase",
        },
      }}
    >
      <Row gutter={[0, 0]}>
        {/* {categories.map((category) => {
          return (
            <Col
              span={3}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Avatar src={react_icon} style={{ width: 50, height: 50 }} />
              <div key={category._id}>{category.name}</div>
            </Col>
          );
        })} */}
        {renderCategories()}
      </Row>
    </Card>
  ) : (
    <Spin size="default" />
  );
};

export default CategoryList;
