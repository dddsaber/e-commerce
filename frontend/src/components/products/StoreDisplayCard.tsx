import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  message,
  Row,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { getSourceImage } from "../../utils/handle_image_func";
import { Store } from "../../type/store.type";
import { getStoreById } from "../../api/store.api";
import { useNavigate } from "react-router-dom";
interface StoreDisplayCardProps {
  storeId: string;
}
const StoreDisplayCard: React.FC<StoreDisplayCardProps> = ({ storeId }) => {
  const [store, setStore] = useState<Store>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;

      // Call API to get store data by id and update state with the returned data
      const storeData = await getStoreById(storeId);
      setStore(storeData);
    };
    fetchData();
  }, [storeId]);

  const handleNavigate = () => {
    if (!store) {
      message.error(`Store not found!`);
      return;
    }
    navigate("/chat", {
      state: { userId: store.userId }, // Truyền userId qua state
    });
  };

  return (
    <Card style={{ margin: "20px 0" }}>
      <Row gutter={[12, 12]}>
        <Col span={2}>
          <Avatar
            src={getSourceImage(store?.logo ?? "")}
            style={{ height: "90px", width: "90px", cursor: "pointer" }}
            onClick={() => {
              navigate(`/store/${storeId}`);
            }}
          />
        </Col>
        <Col span={6}>
          <Typography.Title level={4} style={{ margin: "0 0 2px" }}>
            {store?.name}
          </Typography.Title>
          <Typography.Text style={{ color: "$e5e5e5" }}>
            Online 3h trước
          </Typography.Text>
          <Flex style={{ marginTop: "10px" }}>
            <Button
              style={{
                height: 45,
                width: 140,
                fontSize: 18,
                color: "white",
                backgroundColor: "red",
                border: "1px solid white",
                borderRadius: 5,
              }}
              onClick={handleNavigate}
            >
              Chat ngay
            </Button>
            <Button
              style={{
                height: 45,
                width: 140,
                fontSize: 18,
                marginLeft: 10,
                color: "red",
                backgroundColor: "white",
                border: "1px solid red",
                borderRadius: 5,
              }}
            >
              Xem shop
            </Button>
          </Flex>
        </Col>
        <Col span={16}>
          <Descriptions
            size="middle"
            styles={{
              label: { fontSize: "16px" },
              content: { fontSize: "15px" },
            }}
          >
            <Descriptions.Item label="Đánh Giá"> 5,3k</Descriptions.Item>
            <Descriptions.Item label="Tỉ Lệ Phản Hồi">98%</Descriptions.Item>
            <Descriptions.Item label="Tham Gia">4 năm trước</Descriptions.Item>
            <Descriptions.Item label="Sản Phẩm">40</Descriptions.Item>
            <Descriptions.Item label="Thời Gian Phản hồi">
              trong vài giờ
            </Descriptions.Item>
            <Descriptions.Item label="Người Theo Dõi">30k</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default StoreDisplayCard;
