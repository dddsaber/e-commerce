import React, { useEffect, useState } from "react";
import { Breadcrumb } from "antd";
import { Review } from "../../../../type/review.type";
import ReviewDrawer from "../../../../components/reviews/ReviewDrawer";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { getStoreByUserId } from "../../../../api/store.api";
import { Store } from "../../../../type/store.type";
import StoreReviewTable from "../../../../components/reviews/StoreReviewTable";
import TableSkeleton from "../../../../components/layout/TableSkeleton";

const StoreReviewsManagePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<Review | undefined>(
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
            href: "/store-manage/dashboard",
            title: "Trang chủ",
          },
          {
            href: "/store-manage/reviews",
            title: "Quản lý bình luận",
          },
        ]}
      />
      {!store && loading ? (
        <TableSkeleton />
      ) : (
        <>
          {store?._id ? (
            <>
              <StoreReviewTable
                setSelectedReview={setSelectedReview}
                showDrawer={showDrawer}
                setLoading={setLoading}
                reload={reload}
                setReload={setReload}
                storeId={store._id}
              />
              <ReviewDrawer
                visible={isVisible}
                onClose={onClose}
                setSelectedReview={setSelectedReview}
                selectedReview={selectedReview}
                reload={reload}
                setReload={setReload}
              />
            </>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default StoreReviewsManagePage;
