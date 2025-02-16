import React, { useState } from "react";
import { Breadcrumb } from "antd";
import { Review } from "../../../type/review.type";
import ReviewTable from "../../../components/reviews/ReviewTable";
import ReviewDrawer from "../../../components/reviews/ReviewDrawer";

const ReviewsManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<Review | undefined>(
    undefined
  );
  const onClose = () => {
    setSelectedReview(undefined);
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
            href: "/admin/manage-reviews",
            title: "Quản lý bình luận",
          },
        ]}
      />
      <ReviewTable
        setSelectedReview={setSelectedReview}
        showDrawer={showDrawer}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
      />
      <ReviewDrawer
        visible={isVisible}
        onClose={onClose}
        setSelectedReview={setSelectedReview}
        selectedReview={selectedReview}
        reload={reload}
        setReload={setReload}
      />
    </div>
  );
};

export default ReviewsManagePage;
