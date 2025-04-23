import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Input,
  Spin,
  Switch,
  message,
  Card,
  Select,
  Form,
  UploadFile,
  Image,
  Flex,
} from "antd";
import {
  createCustomProductList,
  getCustomProductList,
  updateCustomProductListStatus,
  updateCustomProductListOrder,
  updateCustomProductList,
  deleteCustomProductList,
} from "../../../api/custom_product_list.api";
import { useSelector } from "react-redux";
import { ReactSortable } from "react-sortablejs";
import { RootState } from "../../../redux/store";
import { Store } from "../../../type/store.type";
import { Product } from "../../../type/product.type";
import { getStoreByUserId } from "../../../api/store.api";
import { getProducts } from "../../../api/product.api";
import { CustomProductList } from "../../../type/custom_product_list.type";
import UploadImage from "../../../components/shared/UploadImage";
import { TYPE_IMAGE } from "../../../utils/constant";
import { getSourceImage } from "../../../utils/handle_image_func";
import { DeleteFilled, EditFilled } from "@ant-design/icons";
import ProductHero from "../../../components/products/ProductHero";
import { useNavigate } from "react-router-dom";

const StoreDecorationPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [store, setStore] = useState<Store>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItem, setSelectedItem] = useState<CustomProductList>();
  const [showImage, setShowImage] = useState<boolean>(true);
  const [reload, setReload] = useState<boolean>(false);

  const fetchData = async () => {
    if (!user._id) return;
    setLoading(true);
    try {
      const storeData = await getStoreByUserId(user._id);
      if (!storeData || !storeData._id) {
        return;
      }
      setStore(storeData);
      const customLists = await getCustomProductList(storeData._id);
      setLists(customLists);

      const { products: productList } = await getProducts({
        storeId: storeData._id,
      });
      setProducts(productList);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu" + err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user, reload]);

  const handleCreate = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (!store?._id || !values.name || !values.productIds?.length) {
          return message.warning("Điền đủ thông tin");
        }

        if (imageUrl) {
          values.image = imageUrl;
          setImageUrl("");
        }

        try {
          if (selectedItem) {
            await updateCustomProductList(selectedItem._id, values);
            message.success("Cập nhật thành công!");
          } else {
            const newList = await createCustomProductList({
              ...values,
              storeId: store._id,
              order: 0,
            });
            // Cập nhật thứ tự: đẩy danh sách mới lên đầu
            const updatedOrder = [
              newList._id,
              ...lists.map((item) => item._id),
            ];
            await updateCustomProductListOrder(store._id, updatedOrder);

            message.success("Tạo thành công!");
          }

          setIsVisible(false);
          form.resetFields();
          setReload(!reload);
        } catch (err) {
          message.error("Không thể tạo danh sách" + err);
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleToggleStatus = async (id: string, status: boolean) => {
    try {
      await updateCustomProductListStatus(id, status);
      message.success("Cập nhật trạng thái thành công");
      setReload(!reload);
    } catch {
      message.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleSort = async (sortedIds: string[]) => {
    if (!store?._id) return;
    try {
      console.log(sortedIds);
      await updateCustomProductListOrder(store._id, sortedIds);
      message.success("Cập nhật thứ tự thành công");
      fetchData();
    } catch {
      message.error("Lỗi khi cập nhật thứ tự");
    }
  };

  useEffect(() => {
    const url = selectedItem?.image;
    if (url) setImageUrl(url);
    else setImageUrl("");
  }, [form, selectedItem]);

  const openDrawerForCreate = () => {
    setSelectedItem(undefined);
    setImageUrl("");
    form.resetFields();
    setIsVisible(true);
  };

  const handleEdit = (list: CustomProductList) => {
    setSelectedItem(list);
    setIsVisible(true);
    form.setFieldsValue({
      name: list.name,
      description: list.description,
      image: list.image,
      productIds: list.products.map((product) => product._id),
    });
  };
  const handleDelete = async (list: CustomProductList) => {
    await deleteCustomProductList(list._id);
    setReload(!reload);
  };
  const closeDrawer = () => {
    setIsVisible(false);
    form.resetFields();
    setSelectedItem(undefined);
    setImageUrl("");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Flex
        style={{
          justifyContent: "space-between",
          margin: "10px 20px",
        }}
      >
        <div>
          <Switch
            title="Hiện ảnh minh họa"
            checked={showImage}
            onChange={setShowImage}
          />
          <span>Hiện ảnh minh họa</span>
          <Button
            style={{ marginLeft: 10 }}
            type="primary"
            onClick={() => navigate(`/store/${store?._id}`)}
          >
            Xem cửa hàng
          </Button>
        </div>
        <Button
          type="primary"
          onClick={openDrawerForCreate}
          className="rounded-lg shadow"
        >
          + Thêm danh sách
        </Button>
      </Flex>

      {loading ? (
        <Spin />
      ) : (
        <ReactSortable
          list={lists} // bind the lists array to ReactSortable
          setList={(newState) => {
            console.log("New State after sorting:", newState); // Kiểm tra danh sách mới sau khi thay đổi thứ tự

            // Kiểm tra xem thứ tự có thay đổi không
            const currentIds = lists.map((item: CustomProductList) => item._id);
            const newIds = newState.map((item: CustomProductList) => item._id);

            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
              setLists(newState); // Cập nhật danh sách trong state frontend

              // Tạo danh sách mới với các ID đã thay đổi thứ tự
              const updatedOrder = newState.map(
                (item: CustomProductList) => item._id
              );
              console.log("Updated Order IDs:", updatedOrder); // Kiểm tra danh sách ID mới

              // Gửi thứ tự mới lên server để lưu
              handleSort(updatedOrder);
            }
          }}
          tag="div"
          style={{
            margin: "0 20px",
          }}
        >
          {lists.map((item) => (
            <div
              style={{ margin: "10px", cursor: "pointer" }}
              key={item._id}
              data-id={item._id}
            >
              <Card
                title={<span className="text-lg font-medium">{item.name}</span>}
                styles={{
                  body: {
                    padding: 0,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    margin: "0",
                  },
                }}
                extra={
                  <>
                    <Switch
                      size="small"
                      checked={item.isActive}
                      onChange={(checked) =>
                        handleToggleStatus(item._id, checked)
                      }
                    />
                    <Button
                      icon={<EditFilled />}
                      type="link"
                      onClick={() => handleEdit(item)}
                      style={{ color: "green" }}
                    />
                    <Button
                      icon={<DeleteFilled />}
                      type="link"
                      onClick={() => handleDelete(item)}
                      style={{ color: "red" }}
                    />
                  </>
                }
              ></Card>
              <Flex
                style={{
                  justifyContent: "center",
                  flexBasis: 1,
                  flexDirection: "column",
                }}
              >
                {showImage && item.image && (
                  <Image
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      margin: "5px 0",
                    }}
                    src={getSourceImage(item.image)}
                    preview={false}
                  />
                )}

                <ProductHero products={products} key={item._id} />
              </Flex>
            </div>
          ))}
        </ReactSortable>
      )}
      <Drawer
        title={
          <span className="text-lg font-semibold">
            {selectedItem
              ? "Chỉnh sửa danh sách sản phẩm"
              : "Thêm danh sách sản phẩm"}
          </span>
        }
        open={isVisible}
        onClose={closeDrawer}
        width={420}
        bodyStyle={{ padding: "24px 16px" }}
      >
        <Form
          form={form}
          layout="vertical"
          className="space-y-4"
          initialValues={selectedItem ? { ...selectedItem } : {}}
        >
          <Form.Item
            name="name"
            label="Tên danh sách"
            rules={[{ required: true, message: "Tên danh sách là bắt buộc" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="image" label="URL ảnh">
            <UploadImage
              fileList={fileList}
              setFileList={setFileList}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              loading={loading}
              key={"upload_product_file"}
              typeFile={TYPE_IMAGE.store}
            />
          </Form.Item>

          <Form.Item
            name="productIds"
            label="Chọn sản phẩm"
            rules={[{ required: true, message: "Chọn ít nhất một sản phẩm" }]}
          >
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Chọn sản phẩm"
              options={products.map((product) => ({
                label: product.name,
                value: product._id,
              }))}
            />
          </Form.Item>

          <Button type="primary" block onClick={handleCreate} loading={loading}>
            {selectedItem ? "Cập nhật" : "Tạo danh sách"}
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default StoreDecorationPage;
