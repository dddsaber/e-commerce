import { Breadcrumb } from "antd";
import React, { useState } from "react";
import StoreRevenueTable from "../../../components/stores/StoreRevenueTable";
import StoreRevenueChart from "../../../components/stores/StoreRevenueChart";
import { StoreRevenue } from "../../../type/statistic.type";

const StoresRevenuePage: React.FC = () => {
  const [data, setData] = useState<StoreRevenue[]>([]);

  const [reload, setReload] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div>
      <Breadcrumb
        items={[
          {
            href: "/admin",
            title: "Trang chủ",
          },
          {
            href: "/admin/stores-revenue",
            title: "Quản lý cửa hàng",
          },
        ]}
      />
      <div style={{ width: "100%" }}>
        <StoreRevenueChart data={data} />
      </div>
      <StoreRevenueTable
        reload={reload}
        setLoading={setLoading}
        loading={loading}
        setReload={setReload}
        data={data}
        setData={setData}
      />
    </div>
  );
};

export default StoresRevenuePage;
