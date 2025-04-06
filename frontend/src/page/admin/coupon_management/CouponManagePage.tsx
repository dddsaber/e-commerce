import React, { useState } from "react";
import CouponTable from "../../../components/coupons/CouponTable";
import CouponDrawer from "../../../components/coupons/CouponDrawer";
import { Coupon } from "../../../type/coupon.type";

const CouponsManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(
    undefined
  );
  const onClose = () => {
    setSelectedCoupon(undefined);
    setIsVisible(false);
  };

  const showDrawer = () => {
    setIsVisible(true);
  };

  return (
    <div>
      <CouponTable
        loading={loading}
        setSelectedCoupon={setSelectedCoupon}
        showDrawer={showDrawer}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
        scope="all"
      />
      <CouponDrawer
        visible={isVisible}
        onClose={onClose}
        selectedCoupon={selectedCoupon}
        loading={loading}
        setSelectedCoupon={setSelectedCoupon}
        reload={reload}
        setReload={setReload}
      />
    </div>
  );
};

export default CouponsManagePage;
