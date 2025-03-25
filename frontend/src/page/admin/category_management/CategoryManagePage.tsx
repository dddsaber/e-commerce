import React, { useState } from "react";
import { Breadcrumb } from "antd";
import { Category } from "../../../type/category.type";
import CategoryTable from "../../../components/categories/CategoryTable";
import CategoryDrawer from "../../../components/categories/CategoryDrawer";

const CategoryManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);
  const onClose = () => {
    setSelectedCategory(undefined);
    setIsVisible(false);
  };

  const showDrawer = () => {
    setIsVisible(true);
  };

  return (
    <div>
      <Breadcrumb
        items={[
          {
            href: "/admin",
            title: "Trang chủ",
          },
          {
            href: "/admin/manage-category",
            title: "Quản lý danh mục",
          },
        ]}
      />

      <CategoryTable
        setSelectedCategory={setSelectedCategory}
        showDrawer={showDrawer}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
      />
      <CategoryDrawer
        visible={isVisible}
        onClose={onClose}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        reload={reload}
        setReload={setReload}
        setLoading={setLoading}
        loading={loading}
      />
    </div>
  );
};

export default CategoryManagePage;
