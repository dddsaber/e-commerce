import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import CouponTable from "../../../../components/coupons/CouponTable";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { Store } from "../../../../type/store.type";
import { getStoreByUserId } from "../../../../api/store.api";
import { Coupon } from "../../../../type/coupon.type";
import CouponDrawer from "../../../../components/coupons/CouponDrawer";
import TableSkeleton from "../../../../components/layout/TableSkeleton";

const StoreCampaignsPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(
    undefined
  );

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
    <>
      <Breadcrumb
        items={[
          {
            href: "/store-manage",
            title: "Trang chủ",
          },
          {
            href: "/store-manage/campaigns",
            title: "Quản lý phiếu giảm giá",
          },
        ]}
      />

      {!store && loading ? (
        <TableSkeleton />
      ) : (
        <>
          {store?._id ? (
            <>
              <CouponTable
                setSelectedCoupon={setSelectedCoupon}
                showDrawer={showDrawer}
                setLoading={setLoading}
                reload={reload}
                setReload={setReload}
                scope="all"
                storeId={store?._id}
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
        </>
      )}
    </>
  );
};

export default StoreCampaignsPage;
