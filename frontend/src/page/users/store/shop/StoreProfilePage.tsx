import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Spin,
  Flex,
  UploadFile,
  message,
  Breadcrumb,
  Image,
} from "antd";
import { Store } from "../../../../type/store.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import {
  getStoreByUserId,
  updateStoreInformation,
} from "../../../../api/store.api";
import UploadImage from "../../../../components/shared/UploadImage";
import { TYPE_IMAGE } from "../../../../utils/constant";
import { formatDate } from "../../../../utils/handle_format_func";
import { getSourceImage } from "../../../../utils/handle_image_func";

const { Title } = Typography;

const StoreProfilePge: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [store, setStore] = useState<Store>();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) return;
      try {
        setLoading(true);
        const data = await getStoreByUserId(user._id);
        if (data) setStore(data);
      } catch (error) {
        console.log(error);
        message.error("Error loading store data!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, reload]);

  useEffect(() => {
    const logo = store?.logo;
    if (logo) setLogoUrl(logo);
    else setImageUrl("");

    const bg = store?.backgroundImage;
    if (bg) setImageUrl(bg);
    else setImageUrl("");
  }, [form, store]);

  const handleChange = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (imageUrl) {
          values.backgroundImage = imageUrl;
        }
        if (logoUrl) {
          values.logo = logoUrl;
        }
        const result = await updateStoreInformation({
          ...values,
          _id: store?._id,
        });
        if (result) {
          message.success("Cập nhật thông tin cửa hàng thành công!");
        } else {
          message.error("Có l��i xảy ra, vui lòng thử lại!");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      })
      .finally(() => {
        form.resetFields();
        setImageUrl("");
        setLogoUrl("");
        setReload(!reload);
      });
  };

  return (
    <>
      <Breadcrumb
        items={[
          {
            href: "/store-manage/dashboard",
            title: "Bảng điều khiển",
          },
          {
            href: "/store-manage/shop-profile",
            title: "Tất cả đơn hàng",
          },
        ]}
      />
      <Card
        style={{
          position: "relative",
          width: "100%",
          height: "300px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "10px",
          overflow: "hidden",
          margin: "20px 0",
          backgroundImage: `url(${getSourceImage(
            store?.backgroundImage || "/default-logo.png"
          )})`,
        }}
      >
        <Image
          src={getSourceImage(store?.logo || "/default-logo.png")}
          width={120}
          height={120}
          style={{
            position: "absolute",
            top: "120px",
            left: "15px",
            borderRadius: "50%",
            border: "3px solid white",
            objectFit: "cover",
          }}
        />
      </Card>
      {store?._id && !loading ? (
        <Card>
          <Title style={{ textAlign: "center" }} level={3}>
            Thông tin cửa hàng
          </Title>
          <Row gutter={[16, 16]}>
            {/* Thông tin cơ bản */}
            <Col span={16}>
              <Form form={form} layout="vertical" initialValues={store}>
                <Form.Item name="name" label="Tên cửa hàng">
                  <Input />
                </Form.Item>

                <Form.Item name="email" label="Email">
                  <Input />
                </Form.Item>

                <Form.Item name="phone" label="Số điện thoại">
                  <Input />
                </Form.Item>

                <Row gutter={[12, 12]}>
                  <Col span={8}>
                    <Form.Item name={["address", "province"]} label="Tỉnh">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name={["address", "district"]} label="Huyện">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name={["address", "ward"]} label="Xã">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name={["address", "details"]} label="Địa chỉ">
                  <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                  style={{ textAlign: "center", alignItems: "center" }}
                >
                  <Button type="primary" onClick={handleChange}>
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </Col>

            {/* Ảnh & Thống kê */}
            <Col span={8}>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Form.Item label="Logo">
                    <UploadImage
                      fileList={fileList}
                      setFileList={setFileList}
                      imageUrl={logoUrl}
                      setImageUrl={setLogoUrl}
                      loading={loading}
                      key={"upload_store_logo"}
                      typeFile={TYPE_IMAGE.store}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Ảnh nền">
                    <UploadImage
                      fileList={fileList}
                      setFileList={setFileList}
                      imageUrl={imageUrl}
                      setImageUrl={setImageUrl}
                      loading={loading}
                      key={"upload_store_background"}
                      typeFile={TYPE_IMAGE.store}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Card title="Thống kê">
                <Statistic
                  title="Sản phẩm"
                  value={store.statistics?.totalProducts || 0}
                />
                <Statistic
                  title="Doanh thu tháng"
                  value={store.statistics?.monthlyRevenue || 0}
                />
                <Statistic
                  title="Đánh giá"
                  value={store.statistics?.rating || 0}
                  precision={1}
                />
                <Statistic
                  title="Lượt truy cập"
                  value={store.statistics?.visited || 0}
                />
              </Card>
              <Card style={{ margin: "15px 0" }}>
                <Typography.Text>
                  Ngày tạo cửa hàng: {formatDate(store.createdAt!)}
                  <br />
                </Typography.Text>
                <Typography.Text>
                  Cập nhật gần đây: {formatDate(store.updatedAt!)}
                </Typography.Text>
              </Card>
            </Col>
          </Row>
        </Card>
      ) : (
        <Flex style={{ justifyContent: "center", alignItems: "center" }}>
          <Spin size="large" />
        </Flex>
      )}
    </>
  );
};

export default StoreProfilePge;
