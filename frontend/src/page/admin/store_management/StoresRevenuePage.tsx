import React, { useState } from "react";
import StoreRevenueTable from "../../../components/stores/StoreRevenueTable";
import { StoreRevenue } from "../../../type/statistic.type";

const StoresRevenuePage: React.FC = () => {
  const [data, setData] = useState<StoreRevenue[]>([]);

  const [reload, setReload] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div>
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
