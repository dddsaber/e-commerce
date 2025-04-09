import React, { useEffect, useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Switch,
  notification,
  UploadFile,
  InputNumber,
  Row,
  Col,
  Select,
  Spin,
  Descriptions,
  Modal,
  Typography,
} from "antd";
import { Inventory, Product } from "../../type/product.type";
import {
  createProduct,
  createReceipt,
  updateProduct,
} from "../../api/product.api";
import { Category } from "../../type/category.type";
import { getSelectCategories } from "../../api/category.api";
import TextArea from "antd/es/input/TextArea";
import UploadImage from "../shared/UploadImage";
import { TYPE_IMAGE } from "../../utils/constant";
import UploadImages from "../shared/UploadImages";

interface ProductDrawerProps {
  storeId?: string;
  visible: boolean;
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedProduct: (value: Product | undefined) => void;
  onClose: () => void;
  selectedProduct?: Product;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({
  storeId,
  visible,
  reload,
  setReload,
  loading,
  setLoading,
  setSelectedProduct,
  onClose,
  selectedProduct = undefined,
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [receiptform] = Form.useForm();
  const [isVisible, setIsVisible] = useState<boolean>(false);

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

  useEffect(() => {
    const url = selectedProduct?.image;
    if (url) setImageUrl(url);
    else setImageUrl("");
    const urls = selectedProduct?.sideImages;
    if (urls) setImageUrls(urls);
    else setImageUrls([]);
  }, [form, selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      // Reset lại thông tin kho khi chọn sản phẩm mới
      receiptform.setFieldsValue({
        inventoryId: selectedProduct.inventory?._id || "",
        quantity: 1, // hoặc giá trị mặc định cho quantity
        provider: "", // Reset provider nếu cần
      });
    }
  }, [selectedProduct, receiptform]);

  const handleReceipt = async () => {
    receiptform.validateFields().then(async (values) => {
      const result = await createReceipt(values);
      if (result) {
        notification.success({ message: `+ ${result.quantity} vào kho` });

        const newInventory: Inventory = {
          ...selectedProduct?.inventory,
          quantity: selectedProduct?.inventory?.quantity + values.quantity,
        };

        if (selectedProduct) {
          setSelectedProduct({
            ...selectedProduct,
            inventory: newInventory,
          });
        }

        setIsVisible(false);
      }
      setReload(!reload);
    });
  };

  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (imageUrl) {
          values.image = imageUrl;
          setImageUrl("");
        }
        if (imageUrls) {
          values.sideImages = imageUrls;
          setImageUrls([]);
        }
        if (selectedProduct) {
          const result = await updateProduct({
            ...values,
            _id: selectedProduct._id,
          });
          if (result) {
            notification.success({
              message: `Cập nhật sản phẩm ${selectedProduct.name} thành công!`,
            });
          }
        } else {
          values.storeId = storeId;
          const result = await createProduct(values);
          if (result) {
            notification.success({ message: "Thêm sản phẩm thành công!" });
          }
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      })
      .finally(() => {
        form.resetFields();
        onClose();
        setSelectedProduct(undefined);
        setReload(!reload);
      });
  };

  return (
    <Drawer
      title={
        selectedProduct?.name
          ? `Chỉnh sửa sản phẩm - ${selectedProduct.store.name}`
          : "Thêm sản phẩm"
      }
      width={800}
      open={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" onClick={() => form.submit()}>
            Lưu
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          selectedProduct
            ? {
                ...selectedProduct,
                categoryId: selectedProduct.category._id,
              }
            : { isActive: true, cost: 0, price: 0, discount: 0 }
        }
        onFinish={handleSubmit}
        clearOnDestroy
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 15 }}>
          <Col span={8}>
            {" "}
            {/* Image */}
            <Typography.Title level={5}>Ảnh chính</Typography.Title>
            <UploadImage
              fileList={fileList}
              setFileList={setFileList}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              loading={loading}
              key={"upload_product_file"}
              typeFile={TYPE_IMAGE.product}
            />
          </Col>
          <Col span={24}>
            <Typography.Title level={5}>Các ảnh phụ</Typography.Title>

            <UploadImages
              fileList={fileList}
              setFileList={setFileList}
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
              loading={loading}
              key={"upload_product_file"}
              typeFile={TYPE_IMAGE.product}
            />
          </Col>

          <Col span={16}>
            {/* Tên sản phẩm */}
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[
                { required: true, message: "Vui lòng nhập tên sản phẩm!" },
              ]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {" "}
          {/* Khoảng cách giữa các cột */}
          <Col span={8}>
            {/* Giá nhập */}
            <Form.Item name="cost" label="Giá nhập">
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={8}>
            {/* Giá bán */}
            <Form.Item name="price" label="Giá bán">
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={8}>
            {/* Giảm giá */}
            <Form.Item
              name="discount"
              label="Giảm giá"
              rules={[
                {
                  type: "number", // Đảm bảo giá trị nhập vào là số
                  min: 0,
                  max: 1,
                  message: "Giảm giá phải >= 0 và <= 1",
                },
              ]}
            >
              <InputNumber step={0.01} min={0} max={1} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginBottom: 15 }}>
          <Col span={8}>
            {/* Kích cỡ */}
            <Form.Item name="size" label="Kích cỡ">
              <Input placeholder="Nhập kích thước" />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name="categoryId" label="Danh mục">
              <Select
                showSearch
                virtual={false}
                style={{ width: "100%", overflowY: "auto" }}
                notFoundContent={
                  loading ? <Spin size="small" key="loading" /> : null
                }
                placeholder="Chọn danh mục"
                filterOption={(input, option) =>
                  (option?.label as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={categories.map((category) => ({
                  label: category.name,
                  value: category._id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Mô tả */}
        <Form.Item name="description" label="Mô tả">
          <TextArea placeholder="Mô tả sản phẩm" />
        </Form.Item>
        {/* Trạng thái hoạt động */}
        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Bị khóa" />
        </Form.Item>
      </Form>
      {/* Kho hàng */}
      <Descriptions title="Thông tin kho" column={4} size="default">
        <Descriptions.Item label="Tồn kho">
          {selectedProduct?.inventory?.quantity}
        </Descriptions.Item>
        <Descriptions.Item label="Đặt trước">
          {selectedProduct?.inventory?.reservedQuantity}
        </Descriptions.Item>
        <Descriptions.Item label="Đã bán">
          {selectedProduct?.inventory?.soldQuantity}
        </Descriptions.Item>
        <Descriptions.Item>
          <Button
            style={{
              backgroundColor: "#26415E",
              color: "white",
              borderColor: "#26415E  ",
            }}
            onClick={() => setIsVisible(true)}
          >
            Nhập kho
          </Button>
        </Descriptions.Item>
      </Descriptions>
      <Modal
        open={isVisible}
        title={"Nhập kho"}
        okText={"Ok"}
        onOk={handleReceipt}
        onCancel={() => setIsVisible(false)}
        destroyOnClose
        cancelText="Hủy"
        style={{ top: 100, width: 500 }}
      >
        <Form
          form={receiptform}
          name="addBookForm"
          initialValues={{
            _id: "",
            inventoryId: selectedProduct?.inventory?._id,
            quantity: 1,
            provider: "",
          }}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ marginTop: 0 }}
        >
          <Form.Item
            name="inventoryId"
            label="Mã"
            rules={[{ required: true, message: "Vui lòng nhập mã kho!" }]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item name="quantity" label="Số lượng">
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="provider" label="Nhà cung cấp">
            <TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

export default ProductDrawer;
