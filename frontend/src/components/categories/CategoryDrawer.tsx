import React, { useEffect, useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Switch,
  message,
  Select,
  InputNumber,
} from "antd";
import { Category } from "../../type/category.type";
import {
  createCategory,
  getCategoryByParentId,
  updateCategory,
} from "../../api/category.api";

interface CategoryDrawerProps {
  visible: boolean;
  reload: boolean;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setReload: (value: boolean) => void;
  setSelectedCategory: (value: Category | undefined) => void;
  onClose: () => void;
  selectedCategory?: Category;
}

const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  visible,
  reload,
  setLoading,
  setReload,
  setSelectedCategory,
  onClose,
  selectedCategory = undefined,
}) => {
  const [form] = Form.useForm();
  const [rootCategories, setRootCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategoryLv1 = async () => {
      setLoading(true);
      try {
        const response = await getCategoryByParentId("root");
        setRootCategories(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryLv1();
  }, []);

  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (selectedCategory) {
          const result = await updateCategory({
            ...values,
            _id: selectedCategory._id,
          });
          if (result) {
            message.success("Cập nhật danh mục thành công");
          }
        } else {
          const result = await createCategory(values);
          if (result) {
            message.success("Thêm danh mục thành công");
          }
        }

        form.resetFields();
        onClose();
        setSelectedCategory(undefined);
        setReload(!reload);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Drawer
      title={selectedCategory?.name ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
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
        initialValues={{
          ...selectedCategory,
          parentId: selectedCategory?.parentId?._id,
        }}
        onFinish={handleSubmit}
        clearOnDestroy
      >
        {/* Danh mục */}
        <Form.Item name="name" label="Tên danh mục">
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        {/* Phí cố định  */}
        <Form.Item
          name="commissionFee"
          label="Phần trăm phí cố định"
          rules={[
            { min: 0, max: 1, message: "Phần trăm phí cố định >=0 và <1" },
          ]}
        >
          <InputNumber placeholder="Nhập phần trăm phí cố định" />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item name="description" label="Mô tả">
          <Input placeholder="Nhập mô tả danh mục" />
        </Form.Item>

        {/* Category cha */}
        <Form.Item label="Danh mục cha" name="parentId">
          <Select
            showSearch
            placeholder="Chọn danh mục cha"
            filterOption={(input, option) =>
              (option as unknown as { children: string }).children
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={rootCategories.map((category) => ({
              label: category.name,
              value: category._id,
            }))}
          />
        </Form.Item>

        {/* Trạng thái hoạt động */}
        <Form.Item name="isDeleted" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Bị khóa" unCheckedChildren="Hoạt động" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CategoryDrawer;
