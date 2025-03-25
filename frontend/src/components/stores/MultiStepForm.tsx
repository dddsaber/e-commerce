import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Radio,
  Steps,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { Store } from "../../type/store.type";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  getStoreByUserId,
  storeInfoRegistration,
  storeTaxRegistration,
  storeIdentityRegistration,
} from "../../api/store.api";
import { getUserById } from "../../api/user.api";

const Step1: React.FC<{
  onNext: () => void;
  store?: Store;
  setStore: (store?: Store) => void;
  userId: string;
}> = ({ onNext, store, setStore, userId }) => {
  const [form] = Form.useForm();

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const { name, email, phone, ...objAddress } = values;
      const record: Store = {
        userId,
        name,
        email,
        phone,
        address: {
          province: objAddress.province,
          district: objAddress.district,
          ward: objAddress.ward,
          details: objAddress.details,
        },
      };
      console.log(record);
      const data = await storeInfoRegistration(record);
      if (data) setStore(data);
      onNext();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  useEffect(() => {
    if (store) {
      form.setFieldsValue({
        name: store.name,
        email: store.email,
        phone: store.phone,
        province: store.address?.province,
        district: store.address?.district,
        ward: store.address?.ward,
        details: store.address?.details,
      });
    }
  }, [store]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Tên cửa hàng"
        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Vui lòng nhập email!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="phone"
        label="Số điện thoại"
        rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
      >
        <Input />
      </Form.Item>
      <Typography.Title level={5}>Địa chỉ lấy hàng</Typography.Title>

      <Form.Item
        name="province"
        label="Tỉnh"
        rules={[{ required: true, message: "Vui lòng nhập tỉnh!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="district"
        label="Huyện"
        rules={[{ required: true, message: "Vui lòng nhập huyện!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ward"
        label="Xã"
        rules={[{ required: true, message: "Vui lòng nhập xã!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="details"
        label="Chi tiết"
        rules={[{ required: true, message: "Vui lòng nhập chi tiết!" }]}
      >
        <Input />
      </Form.Item>
      <Button type="primary" onClick={handleNext}>
        Next
      </Button>
    </Form>
  );
};

const Step2: React.FC<{
  onNext: () => void;
  onPrev: () => void;
  setStore: (store?: Store) => void;
  store?: Store;
}> = ({ onNext, onPrev, setStore, store }) => {
  const [form] = Form.useForm();

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const taxInformation = {
        businessType: values.businessType,
        businessRegistrationAddress: {
          province: values.province,
          district: values.district,
          ward: values.ward,
          details: values.details,
        },
        receiveEInvoiceEmail: values.receiveEInvoiceEmail,
        taxCode: values.taxCode,
      };

      const data = await storeTaxRegistration(store!._id!, taxInformation);
      if (data) {
        setStore(data);
      }
      onNext();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  useEffect(() => {
    console.log(store);
    if (store?.taxInformation) {
      console.log("Giá trị store nhận được:", store); // Debug dữ liệu store
      form.setFieldsValue({
        businessType: store?.taxInformation?.businessType || "",
        receiveEInvoiceEmail: store?.taxInformation?.receiveEInvoiceEmail || "",
        province:
          store?.taxInformation?.businessRegistrationAddress?.province || "",
        district:
          store?.taxInformation?.businessRegistrationAddress?.district || "",
        ward: store?.taxInformation?.businessRegistrationAddress?.ward || "",
        details:
          store?.taxInformation?.businessRegistrationAddress?.details || "",
        taxCode: store?.taxInformation?.taxCode || "",
      });
    }
  }, [store, form]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="businessType"
        label="Loại hình kinh doanh"
        rules={[
          { required: true, message: "Vui lòng chọn loại hình kinh doanh!" },
        ]}
      >
        <Radio.Group>
          <Radio value="Sole Proprietorship">Cá nhân</Radio>
          <Radio value="Household Business">Hộ kinh doanh</Radio>
          <Radio value="Company">Công ty</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        name="receiveEInvoiceEmail"
        label="Email nhận hóa đơn điện tử"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập email nhận hóa đơn điện tử!",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Typography.Title level={5}>Địa chỉ đăng ký kinh doanh</Typography.Title>
      <Form.Item
        name="province"
        label="Tỉnh"
        rules={[{ required: true, message: "Vui lòng nhập tỉnh!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="district"
        label="Huyện"
        rules={[{ required: true, message: "Vui lòng nhập huyện!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ward"
        label="Xã"
        rules={[{ required: true, message: "Vui lòng nhập xã!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="details"
        label="Chi tiết"
        rules={[{ required: true, message: "Vui lòng nhập chi tiết!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="taxCode"
        label="Mã thuế"
        rules={[{ len: 14, message: "Vui lòng nhập chính xác 14 ký tự!" }]}
      >
        <Input placeholder="/14" />
      </Form.Item>
      <Button onClick={onPrev} style={{ marginRight: 8 }}>
        Previous
      </Button>
      <Button type="primary" onClick={handleNext}>
        Next
      </Button>
    </Form>
  );
};

const Step3: React.FC<{
  onPrev: () => void;
  onNext: () => void;
  setStore: (store?: Store) => void;
  store?: Store;
  userId: string;
}> = ({ onPrev, onNext, setStore, store, userId }) => {
  const [form] = Form.useForm();

  const cccdRegex =
    /^(0[1-9]|[1-8][0-9]|9[0-8])([0-9]{2})([0-9]{2})([0-9]{6})$/;
  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const identityNumber = values.identityNumber.trim();
      if (!cccdRegex.test(identityNumber)) {
        message.error("Số CCCD/CMND không đúng định dạng!");
        return;
      }
      const data = await storeIdentityRegistration(store!._id!, userId, values);
      if (data) setStore(data);
      onNext();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const user = await getUserById(userId);
      if (user) {
        form.setFieldsValue({
          fullname: user.identityCard?.fullname,
          identityNumber: user.identityCard?.identityNumber,
        });
      }
    };
    fetchData();
  }, [userId]);

  return (
    <Form form={form} layout="vertical" initialValues={store}>
      <Form.Item
        name="fullname"
        label="Tên đầy đủ"
        rules={[{ required: true, message: "Vui lòng nhập tên đầy đủ!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="identityNumber"
        label="Số CCCD/CMND"
        rules={[{ required: true, message: "Vui lòng nhập CCCD/CMND!" }]}
      >
        <Input />
      </Form.Item>
      <Button onClick={onPrev} style={{ marginRight: 8 }}>
        Previous
      </Button>
      <Button type="primary" onClick={handleFinish}>
        Next
      </Button>
    </Form>
  );
};
const Step4: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Typography.Title level={3}>Đăng ký thành công!</Typography.Title>
      <Typography.Paragraph>
        Cảm ơn bạn đã hoàn thành quá trình đăng ký. Nhấn vào nút bên dưới để
        quay về trang chủ.
      </Typography.Paragraph>
      <Button type="primary" onClick={onFinish}>
        Về trang chủ
      </Button>
    </div>
  );
};
const MultiStepForm: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [current, setCurrent] = useState(0);
  const [store, setStore] = useState<Store>();

  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) return;
      const data = await getStoreByUserId(user._id);
      if (data) {
        setStore(data);
        setCurrent(0);
      }
    };
    fetchData();
  }, [user]);

  const navigate = useNavigate();
  const nextStep = () => setCurrent(current + 1);
  const prevStep = () => setCurrent(current - 1);
  const handleFinish = () => {
    message.success("Hoàn tất đăng ký!");
    navigate("/");
  };

  const steps = [
    {
      title: "Thông tin cửa hàng",
      content: (
        <Step1
          userId={user._id}
          store={store}
          setStore={setStore}
          onNext={nextStep}
        />
      ),
    },
    {
      title: "Thông tin thuế",
      content: (
        <Step2
          store={store}
          setStore={setStore}
          onNext={nextStep}
          onPrev={prevStep}
        />
      ),
    },
    {
      title: "Thông tin định danh",
      content: (
        <Step3
          store={store}
          setStore={setStore}
          onPrev={prevStep}
          onNext={nextStep}
          userId={user._id}
        />
      ),
    },
    { title: "Hoàn tất", content: <Step4 onFinish={handleFinish} /> },
  ];

  return (
    <Card>
      <Steps
        current={current}
        items={steps.map((step) => ({ key: step.title, title: step.title }))}
      />
      <div style={{ marginTop: 24 }}>{steps[current].content}</div>
    </Card>
  );
};

export default MultiStepForm;
