import React, { useState } from "react";
import { Address } from "../../../type/user.type";
import AddressComponent from "../../../components/address/AddressComponent";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { Button, Card, Flex, message } from "antd";
import { updateUserAddress } from "../../../api/user.api";
import { reloginAuth } from "../../../redux/slices/authSlice";
const UserAddressPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const [address, setAddress] = useState<Address>(user.address || {});
  const [isModify, setIsModify] = useState<boolean>(false);

  const handleAddressChange = (newAddress: Address | undefined) => {
    setAddress(newAddress || {});
  };

  const changeAddress = async () => {
    if (!address) {
      message.error("No address available!");
      return;
    }
    const response = await updateUserAddress(user._id, address);
    if (response) {
      message.success("Địa chỉ đã được cập nhật thành công!");
      setIsModify(false);
    }
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      dispatch(reloginAuth({ refreshToken }));
    }
  };

  return (
    <Card title="Đổi địa chỉ giao hàng">
      <AddressComponent
        sendData={handleAddressChange}
        user_address={user.address}
        isModify={isModify}
      />
      <Flex justify="center" style={{ marginTop: 20 }}>
        <Button type="primary" onClick={() => setIsModify(!isModify)}>
          Chỉnh sửa
        </Button>
        {isModify && <Button onClick={changeAddress}>Lưu</Button>}
      </Flex>
    </Card>
  );
};

export default UserAddressPage;
