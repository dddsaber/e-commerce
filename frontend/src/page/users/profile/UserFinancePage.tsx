import { useEffect, useState } from "react";
import { Card, Input, Select, Button, Flex, message } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  getFinanceByUserId,
  createCoupon,
  updateCoupon,
} from "../../../api/finance.api";
import { Finance } from "../../../type/finance.type";

const { Option } = Select;

const BANK_OPTIONS = [
  "Vietcombank",
  "VietinBank",
  "BIDV",
  "Agribank",
  "Techcombank",
  "Sacombank",
];

const UserFinancePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [finance, setFinance] = useState<Finance | null>(null);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [form, setForm] = useState({
    bankAccountNumber: "",
    bankName: "",
    accountHolder: "",
  });

  const fetchFinance = async () => {
    try {
      if (!user._id) return;
      const res = await getFinanceByUserId(user._id);
      setFinance(res);
      setForm({
        bankAccountNumber: res.bankAccountNumber || "",
        bankName: res.bankName || "",
        accountHolder: res.accountHolder || "",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Không có finance thì thôi, để tạo mới
      message.error(error);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [user._id]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    try {
      if (!form.bankAccountNumber || !form.bankName || !form.accountHolder) {
        message.warning("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      let res: Finance;
      if (finance) {
        res = await updateCoupon(finance._id, {
          ...finance,
          ...form,
        });
        message.success("Cập nhật thông tin ngân hàng thành công!");
      } else {
        res = await createCoupon({
          userId: user._id,
          ...form,
        });
        message.success("Tạo thông tin ngân hàng thành công!");
      }
      setFinance(res);
      setIsModify(false);
    } catch (err) {
      message.error("Đã có lỗi xảy ra!" + err);
    }
  };

  return (
    <Card title="Tài khoản ngân hàng">
      <Flex vertical gap={16}>
        <Input
          disabled={!isModify}
          placeholder="Số tài khoản"
          value={form.bankAccountNumber}
          onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
        />
        <Select
          disabled={!isModify}
          placeholder="Chọn ngân hàng"
          value={form.bankName || undefined}
          onChange={(value) => handleChange("bankName", value)}
        >
          {BANK_OPTIONS.map((bank) => (
            <Option key={bank} value={bank}>
              {bank}
            </Option>
          ))}
        </Select>
        <Input
          disabled={!isModify}
          placeholder="Chủ tài khoản"
          value={form.accountHolder}
          onChange={(e) => handleChange("accountHolder", e.target.value)}
        />

        <Flex justify="center" gap={12}>
          <Button type="primary" onClick={() => setIsModify(!isModify)}>
            {isModify ? "Hủy" : finance ? "Chỉnh sửa" : "Thêm mới"}
          </Button>
          {isModify && <Button onClick={handleSave}>Lưu</Button>}
        </Flex>
      </Flex>
    </Card>
  );
};

export default UserFinancePage;
