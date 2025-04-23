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
import { getInfo, getStoreById } from "../../api/store.api";
import { useNavigate } from "react-router-dom";
import { renderTimeChatMessage } from "../../utils/handle_format_func";
interface StoreDisplayCardProps {
  storeId: string;
}
const StoreDisplayCard: React.FC<StoreDisplayCardProps> = ({ storeId }) => {
  const [store, setStore] = useState<Store>();
  const [info, setInfo] = useState<{
    totalProducts: number;
    totalFollowed: number;
  }>({
    totalProducts: 0,
    totalFollowed: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;

      // Call API to get store data by id and update state with the returned data
      const storeData = await getStoreById(storeId);
      setStore(storeData);

      const infoData = await getInfo(storeId);
      setInfo(infoData);
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
      <Row gutter={[16, 16]} wrap align="middle">
        {/* Avatar */}
        <Col xs={24} sm={6} md={4} style={{ textAlign: "center" }}>
          <Avatar
            src={getSourceImage(store?.logo ?? "")}
            style={{
              height: 90,
              width: 90,
              cursor: "pointer",
              margin: "0 auto",
            }}
            onClick={() => navigate(`/store/${storeId}`)}
          />
        </Col>

        {/* Tên + Trạng thái + Button */}
        <Col xs={24} sm={18} md={8}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {store?.name}
          </Typography.Title>
          <Typography.Text style={{ color: "#888" }}>
            Online 3h trước
          </Typography.Text>
          <Flex
            wrap="wrap"
            gap="small"
            style={{ marginTop: 10 }}
            justify="start"
          >
            <Button
              style={{
                height: 40,
                minWidth: 120,
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
                height: 40,
                minWidth: 120,
                color: "red",
                backgroundColor: "white",
                border: "1px solid red",
                borderRadius: 5,
              }}
              onClick={() => navigate(`/store/${storeId}`)}
            >
              Xem shop
            </Button>
          </Flex>
        </Col>

        {/* Thống kê */}
        <Col xs={24} md={12}>
          <Descriptions
            size="middle"
            column={{ xs: 1, sm: 2 }}
            layout="horizontal"
            styles={{
              label: { fontSize: "15px" },
              content: { fontSize: "15px", fontWeight: 500 },
            }}
          >
            <Descriptions.Item label="Đánh Giá">
              {store?.statistics?.rating}
            </Descriptions.Item>

            <Descriptions.Item label="Sản Phẩm">
              {info.totalProducts}
            </Descriptions.Item>
            <Descriptions.Item label="Người Theo Dõi">
              {info.totalFollowed}
            </Descriptions.Item>
            <Descriptions.Item label="Tham Gia">
              {renderTimeChatMessage(store?.createdAt?.toString())}
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default StoreDisplayCard;
