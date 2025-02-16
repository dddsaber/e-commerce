import React, { useState } from "react";
import { Store } from "../../../type/store.type";
import { Breadcrumb } from "antd";
import StoreTable from "../../../components/stores/StoreTable";
import StoreDrawer from "../../../components/stores/StoreDrawer";
const StoresManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>(
    undefined
  );
  const onClose = () => {
    setSelectedStore(undefined);
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
            href: "/admin/manage-stores",
            title: "Quản lý cửa hàng",
          },
        ]}
      />
      <StoreTable
        loading={loading}
        reload={reload}
        setLoading={setLoading}
        setReload={setReload}
        setSelectedStore={setSelectedStore}
        showDrawer={showDrawer}
      />
      <StoreDrawer
        loading={loading}
        reload={reload}
        onClose={onClose}
        setReload={setReload}
        setselectedStore={setSelectedStore}
        visible={isVisible}
        selectedStore={selectedStore}
      />
    </div>
  );
};

export default StoresManagePage;
