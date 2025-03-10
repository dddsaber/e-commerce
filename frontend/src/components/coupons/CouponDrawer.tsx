import React from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Switch,
  notification,
  InputNumber,
} from "antd";
import { Coupon } from "../../type/coupon.type";
import { createCoupon, updateCoupon } from "../../api/coupon.api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { COUPON_SCOPE } from "../../utils/constant";

interface CouponDrawerProps {
  visible: boolean;
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setSelectedCoupon: (value: Coupon | undefined) => void;
  onClose: () => void;
  selectedCoupon?: Coupon;
  storeId?: string;
}

const CouponDrawer: React.FC<CouponDrawerProps> = ({
  visible,
  reload,
  setReload,
  loading,
  setSelectedCoupon,
  onClose,
  selectedCoupon = undefined,
  storeId,
}) => {
  const [form] = Form.useForm();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        console.log(values);
        if (selectedCoupon) {
          const result = await updateCoupon({
            ...values,
            _id: selectedCoupon._id,
            userId: user._id,
          });
          if (result) {
            notification.success({
              message: "Cập nhật phiếu giảm giá thành công",
            });
          }
        } else {
          const storeApplyCoupon = storeId ? [{ storeId: storeId }] : [];
          const result = await createCoupon({
            ...values,
            userId: user._id,
            storeApplyCoupon,
            scope: storeId ? COUPON_SCOPE.specific : COUPON_SCOPE.all,
          });
          if (result) {
            notification.success({ message: "Thêm phiếu giảm giá thành công" });
          }
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      })
      .finally(() => {
        form.resetFields();
        onClose();
        setSelectedCoupon(undefined);
        setReload(!reload);
      });
  };

  return (
    <Drawer
      title={
        selectedCoupon?.name
          ? "Chỉnh sửa phiếu giảm giá"
          : "Thêm phiếu giảm giá"
      }
      width={800}
      open={visible}
      loading={loading}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" onClick={() => form.submit()}>
            Lưu
          </Button>
        </div>
      }
    >
      {/* Avatar */}

      <Form
        form={form}
        layout="vertical"
        initialValues={selectedCoupon ?? { role: "coupon", isDeleted: true }}
        onFinish={handleSubmit}
        clearOnDestroy
      >
        {/* Tên Phiếu */}
        <Form.Item name="name" label="Tên phiếu giảm giá">
          <Input placeholder="Nhập phiếu giảm giá" />
        </Form.Item>

        {/* Type */}
        <Form.Item name="type" label="Loại phiếu">
          <Select>
            <Select.Option value="percentage">Phần trăm (%)</Select.Option>
            <Select.Option value="fixed">Số cố định</Select.Option>
          </Select>
        </Form.Item>

        {/* Họ tên */}
        <Form.Item name="value" label="Giá trị">
          <InputNumber />
        </Form.Item>

        {/* Ngày áp dụng */}
        <Form.Item name="appliedDate" label="Ngày áp dụng">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* Ngày hết hạn */}
        <Form.Item name="expirationDate" label="Ngày hết hạn">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* Trạng thái hoạt động */}
        <Form.Item name="isDeleted" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Bị khóa" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CouponDrawer;
