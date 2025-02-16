import React, { useState } from "react";
import CouponTable from "../../../components/coupons/CouponTable";
import CouponDrawer from "../../../components/coupons/CouponDrawer";
import { Coupon } from "../../../type/coupon.type";
import { Breadcrumb } from "antd";

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
      <Breadcrumb
        items={[
          {
            href: "/admin",
            title: "Trang chủ",
          },
          {
            href: "/admin/manage-coupons",
            title: "Quản lý phiếu giảm giá",
          },
        ]}
      />
      <CouponTable
        setSelectedCoupon={setSelectedCoupon}
        showDrawer={showDrawer}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
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
