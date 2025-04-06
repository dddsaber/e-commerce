import React, { useEffect, useState } from "react";
import { Coupon } from "../../../type/coupon.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { getStoreByUserId } from "../../../api/store.api";
import { Store } from "../../../type/store.type";
import CouponTable from "../../../components/coupons/CouponTable";
import CouponDrawer from "../../../components/coupons/CouponDrawer";

const StoreCouponsPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>();
  const [store, setStore] = useState<Store>();
  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) {
        return;
      }
      setLoading(true);
      const storeData = await getStoreByUserId(user._id);
      setStore(storeData);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const onClose = () => {
    setSelectedCoupon(undefined);
    setIsVisible(false);
  };

  const showDrawer = () => {
    setIsVisible(true);
  };

  return (
    <div>
      {store?._id ? (
        <>
          <CouponTable
            setSelectedCoupon={setSelectedCoupon}
            showDrawer={showDrawer}
            setLoading={setLoading}
            reload={reload}
            setReload={setReload}
            scope="specific"
            storeId={store?._id}
            loading={loading}
          />
          <CouponDrawer
            visible={isVisible}
            onClose={onClose}
            selectedCoupon={selectedCoupon}
            loading={loading}
            setSelectedCoupon={setSelectedCoupon}
            reload={reload}
            setReload={setReload}
            storeId={store?._id}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default StoreCouponsPage;
