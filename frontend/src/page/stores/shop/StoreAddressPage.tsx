import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Address, Store } from "../../../type/store.type";
import { getStoreByUserId, updateStoreAddress } from "../../../api/store.api";
import { Breadcrumb, Button, Card, Flex, message } from "antd";
import AddressSkeleton from "../../../components/address/AddressSkeleton";
import AddressComponent from "../../../components/address/AddressComponent";

const StoreAddressPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [store, setStore] = useState<Store>();
  const [address, setAddress] = useState<Address>();
  const [reload, setReload] = useState<boolean>();
  const [isModify, setIsModify] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>();

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

  const handleAddressChange = (newAddress: Address | undefined) => {
    setAddress(newAddress);
  };

  const changeAddress = async () => {
    if (!store?._id) {
      message.error(`Store not found!`);
      return;
    }
    if (!address) {
      message.error(`No address available!`);
      return;
    }
    const response = await updateStoreAddress(store._id, address);
    if (response) {
      message.success(`Địa chỉ đã được cập nhật thành công!`);
      setReload(!reload);
    }
  };
  return (
    <>
      <Breadcrumb
        items={[
          {
            href: "/store-manage/dashboard",
            title: "Bảng điều khiển",
          },
          {
            href: "/store-manage/shop-address",
            title: "Địa chỉ shop",
          },
        ]}
      />
      <Card
        title="Đổi địa chỉ giao hàng"
        styles={{
          title: {
            textAlign: "center",
          },
        }}
      >
        {!store && loading ? (
          <AddressSkeleton />
        ) : (
          <AddressComponent
            sendData={handleAddressChange}
            user_address={store?.address}
            isModify={isModify}
          />
        )}
        <Flex
          style={{
            textAlign: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          {isModify ? (
            <>
              <Button onClick={changeAddress}>Lưu thay đổi</Button>
              <Button type="primary" onClick={() => setIsModify(false)}>
                Hủy
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                onClick={() => setIsModify(true)}
                style={{ marginRight: 10 }}
              >
                Thay đổi địa chỉ
              </Button>
            </>
          )}
        </Flex>
      </Card>
    </>
  );
};
export default StoreAddressPage;
