import { Flex, Skeleton } from "antd";
import React from "react";
import "./AddressSkeleton.css";
const AddressSkeleton: React.FC = () => {
  return (
    <div>
      <Flex justify="space-between">
        <label>Tỉnh/Thành Phố</label>
        <Skeleton.Input className="custom-skeleton" />
      </Flex>
      <Flex justify="space-between" style={{ marginTop: "10px" }}>
        <label>Quận/Huyện</label> <Skeleton.Input className="custom-skeleton" />
      </Flex>
      <Flex justify="space-between" style={{ marginTop: "10px" }}>
        <label>Phường/Xã</label> <Skeleton.Input className="custom-skeleton" />
      </Flex>
      <Flex justify="space-between" style={{ marginTop: "10px" }}>
        <label>Địa chỉ nhận hàng</label>{" "}
        <Skeleton.Input className="custom-skeleton" />
      </Flex>
    </div>
  );
};

export default AddressSkeleton;
