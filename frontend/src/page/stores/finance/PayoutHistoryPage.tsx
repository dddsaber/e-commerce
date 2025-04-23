import React, { useEffect, useState } from "react";
import { Payout } from "../../../type/payout.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getStoreByUserId } from "../../../api/store.api";
import { Store } from "../../../type/store.type";
import PayoutTable from "../../../components/payout/PayoutTable";
import PayoutDrawer from "../../../components/payout/PayoutDrawer";

const PayoutHistoryPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | undefined>();
  const [store, setStore] = useState<Store | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) return;
      setLoading(true);

      const storeData = await getStoreByUserId(user._id);

      setStore(storeData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const onClose = () => {
    setSelectedPayout(undefined);
    setIsVisible(false);
  };

  const showDrawer = () => {
    setIsVisible(true);
  };

  return (
    <div>
      {store?._id ? (
        <>
          <PayoutTable
            setSelectedPayout={setSelectedPayout}
            showDrawer={showDrawer}
            setLoading={setLoading}
            reload={reload}
            setReload={setReload}
            loading={loading}
            storeId={store._id}
          />
          <PayoutDrawer
            setLoading={setLoading}
            reload={reload}
            setReload={setReload}
            onClose={onClose}
            visible={isVisible}
            selectedPayout={selectedPayout}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PayoutHistoryPage;
