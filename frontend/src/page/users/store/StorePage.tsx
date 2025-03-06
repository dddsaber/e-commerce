import { Avatar, Button, Card, Col, Descriptions, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Store } from "../../../type/store.type";
import { getStoreById } from "../../../api/store.api";
import { getSourceImage } from "../../../utils/handle_image_func";
import { MessageOutlined, PlusOutlined } from "@ant-design/icons";
import ProductHero from "../../../components/products/ProductHero";

const StorePage: React.FC = () => {
  const [store, setStore] = useState<Store>();

  const { storeId } = useParams();

  useEffect(() => {
    if (!storeId) return;
    const fetchData = async () => {
      // Call API to get store data by id and update state with the returned data
      const storeData = await getStoreById(storeId);
      setStore(storeData);
    };
    fetchData();
  }, [storeId]);

  return (
    <>
      <Card>
        <Row gutter={[12, 12]}>
          <Col span={8}>
            <Row gutter={[10, 10]}>
              <Col span={6}>
                <Avatar
                  src={getSourceImage(store?.logo || "")}
                  style={{ height: 80, width: 80 }}
                />
              </Col>
              <Col span={18}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {store?.name}
                </Typography.Title>
                <Typography.Text style={{ color: "#808080" }}>
                  Online 3h trước
                </Typography.Text>
              </Col>
              <Col span={24}>
                <Button
                  style={{
                    height: 40,
                    width: "40%",
                    margin: "10px 10px 10px 0",
                    color: "red",
                    border: "1px solid red",
                  }}
                >
                  <PlusOutlined /> Theo doi
                </Button>
                <Button
                  style={{
                    height: 40,
                    width: "40%",
                    margin: "10px",
                    color: "red",
                    border: "1px solid red",
                  }}
                >
                  <MessageOutlined /> Tin nhan
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span={16}>
            <Descriptions
              size="middle"
              styles={{
                label: { fontSize: "20px" },
                content: { fontSize: "18px" },
              }}
              column={2}
            >
              <Descriptions.Item label="Đánh Giá"> 5,3k</Descriptions.Item>
              <Descriptions.Item label="Tỉ Lệ Phản Hồi">98%</Descriptions.Item>
              <Descriptions.Item label="Tham Gia">
                4 năm trước
              </Descriptions.Item>
              <Descriptions.Item label="Sản Phẩm">40</Descriptions.Item>
              <Descriptions.Item label="Thời Gian Phản Hồi">
                trong vài giờ
              </Descriptions.Item>
              <Descriptions.Item label="Người Theo Dõi">30k</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
      <ProductHero category="Goi y hom nay" />
      <ProductHero category="Uu dai khung" />
      <ProductHero category="San pham ban chay" />
    </>
  );
};

export default StorePage;
