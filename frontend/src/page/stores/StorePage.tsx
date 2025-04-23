import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Rate,
  Row,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Store } from "../../type/store.type";
import {
  checkFollow,
  followStore,
  getInfo,
  getStoreById,
} from "../../api/store.api";
import { getSourceImage } from "../../utils/handle_image_func";
import {
  MessageOutlined,
  PlusOutlined,
  HeartOutlined,
  StarOutlined,
  NumberOutlined,
  UserAddOutlined,
  ProductOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { CustomProductList } from "../../type/custom_product_list.type";
import { getCustomProductList } from "../../api/custom_product_list.api";
import CustomList from "../../components/custom_product_list/CustomList";
import { renderTimeChatMessage } from "../../utils/handle_format_func";
import ProductsList from "../../components/products/ProductsList";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import ReportModal from "../../components/reports/ReportModal";
import { REPORT_TYPE } from "../../utils/constant";

const StorePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [store, setStore] = useState<Store>();
  const [customList, setCustomList] = useState<CustomProductList[]>([]);
  const [follow, setFollow] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [info, setInfo] = useState<{
    totalProducts: number;
    totalFollowed: number;
  }>({
    totalProducts: 0,
    totalFollowed: 0,
  });
  const { storeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user._id || !storeId) return;
    const check = async () => {
      const follow = await checkFollow(storeId, user._id);
      setFollow(follow ? (follow.isFollowed ? true : false) : false);
    };
    check();
  }, [user, reload]);

  useEffect(() => {
    if (!storeId) return;
    const fetchData = async () => {
      const storeData = await getStoreById(storeId);
      setStore(storeData);

      const infoData = await getInfo(storeId);
      setInfo(infoData);

      const customLists = await getCustomProductList(storeId);
      setCustomList(customLists);
    };
    fetchData();
  }, [storeId, reload]);

  const following = async () => {
    if (!storeId || !user._id) return;
    await followStore(storeId, user._id, !follow);
    setReload(!reload);
  };

  return (
    <>
      <Card>
        <Row gutter={[12, 12]} wrap>
          {/* Bên trái: Cover + Logo + Info + Button */}
          <Col
            xs={24}
            md={10}
            style={{
              backgroundImage: store?.backgroundImage
                ? `url(${getSourceImage(store?.backgroundImage)})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <Row gutter={[10, 10]} align="middle">
              {/* Logo */}
              <Col xs={6}>
                <Avatar
                  src={getSourceImage(store?.logo || "")}
                  style={{ height: 80, width: 80 }}
                />
              </Col>

              {/* Tên và trạng thái */}
              <Col xs={18}>
                <Typography.Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "black",
                    textShadow: "1px 1px 2px black",
                  }}
                >
                  {store?.name}
                </Typography.Title>
                <Typography.Text style={{ color: "#f0f0f0" }}>
                  Online 3h trước
                </Typography.Text>
              </Col>

              {/* Buttons */}
              <Col span={24}>
                <Row gutter={[10, 10]} wrap>
                  <Col xs={12}>
                    <Button
                      block
                      style={{
                        height: 40,
                        color: follow ? "white" : "red",
                        backgroundColor: follow ? "red" : "white",
                        border: follow ? "1px solid white" : "1px solid red",
                      }}
                      onClick={following}
                      icon={follow ? <HeartOutlined /> : <PlusOutlined />}
                    >
                      {follow ? "Đã theo dõi" : "Theo dõi"}
                    </Button>
                  </Col>
                  <Col xs={12}>
                    <Button
                      block
                      style={{
                        height: 40,
                        color: "red",
                        border: "1px solid red",
                      }}
                      onClick={() => {
                        navigate("/chat", {
                          state: { userId: store?.userId },
                        });
                      }}
                      icon={<MessageOutlined />}
                    >
                      Tin nhắn
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          {/* Bên phải: Thống kê */}
          <Col xs={24} md={14} style={{ textAlign: "right" }}>
            <Button type="text" onClick={() => setIsVisible(true)}>
              Báo cáo
            </Button>
            <Descriptions
              size="middle"
              layout="vertical"
              column={{ xs: 1, sm: 2 }}
              styles={{
                label: { fontSize: "16px", color: "black" },
                content: { fontSize: "16px", color: "red" },
              }}
            >
              <Descriptions.Item
                label={
                  <>
                    <StarOutlined style={{ marginRight: 5 }} />
                    Đánh Giá
                  </>
                }
              >
                {store?.statistics?.rating}
                <Rate
                  value={store?.statistics?.rating}
                  style={{ marginLeft: 5 }}
                  allowHalf
                />
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <NumberOutlined style={{ marginRight: 5 }} />
                    Số lượng đánh giá
                  </>
                }
              >
                {store?.statistics?.numberOfRatings}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <UserAddOutlined style={{ marginRight: 5 }} />
                    Tham gia
                  </>
                }
              >
                {renderTimeChatMessage(store?.createdAt?.toString())}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <ProductOutlined style={{ marginRight: 5 }} />
                    Sản phẩm
                  </>
                }
              >
                {info.totalProducts}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <UsergroupAddOutlined style={{ marginRight: 5 }} />
                    Người theo dõi
                  </>
                }
              >
                {info.totalFollowed}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {customList.map((item) => (
        <CustomList customlist={item} key={item._id} />
      ))}
      <ProductsList
        key={store?._id}
        storeId={storeId}
        title="Sản phẩm sẵn có"
      />
      {/* Modal báo cáo */}
      {store && (
        <ReportModal
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          reportCategory={REPORT_TYPE.STORE}
          reportedId={store._id}
          reportItemName={store.name}
        />
      )}
    </>
  );
};

export default StorePage;
