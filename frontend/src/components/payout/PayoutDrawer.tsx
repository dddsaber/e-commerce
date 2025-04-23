import React from "react";
import { Descriptions, Drawer } from "antd";
import { Payout } from "../../type/payout.type";
import { formatDate } from "../../utils/handle_format_func";

interface PayoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedPayout?: Payout;
  reload: boolean;
  setReload: (value: boolean) => void;
  setLoading?: (value: boolean) => void;
}

const PayoutDrawer: React.FC<PayoutDrawerProps> = ({
  visible,
  onClose,
  selectedPayout,
}) => {
  return (
    <Drawer
      title={selectedPayout?._id ? <div>{selectedPayout.storeId}</div> : ""}
      width={700}
      open={visible}
      onClose={onClose}
      destroyOnClose
    >
      <Descriptions
        column={1}
        styles={{
          label: { width: "40%" },
          content: { width: "60%" },
        }}
      >
        <Descriptions.Item label="Mã cửa hàng">
          {selectedPayout?.storeId}
        </Descriptions.Item>
        <Descriptions.Item label="Số đơn hàng">
          {selectedPayout?.orders.length}
        </Descriptions.Item>
        <Descriptions.Item label="Mã các đơn hàng">
          <div>
            {selectedPayout?.orders.map((order, index) => (
              <p key={index} style={{ marginRight: 10 }}>
                {order}
              </p>
            ))}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Số tiền kết toán">
          {selectedPayout?.totalPayout.toLocaleString("vi-VN")} VND
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {selectedPayout?.createdAt
            ? formatDate(selectedPayout.createdAt)
            : "Chưa có"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật">
          {selectedPayout?.updatedAt
            ? formatDate(selectedPayout.updatedAt)
            : "Chưa cập nhật"}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default PayoutDrawer;
