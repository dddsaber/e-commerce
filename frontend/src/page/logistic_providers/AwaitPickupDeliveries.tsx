import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useEffect, useState } from "react";
import { Warehouse } from "../../type/warehouse.type";
import { Delivery } from "../../type/order.type";
import { getWarehouseByUserId } from "../../api/warehouse.api";
import TableSkeleton from "../../components/layout/TableSkeleton";
import DeliveryTable from "../../components/delivery/DeliveryTable";
import DeliveryDrawer from "../../components/delivery/DeliveryDrawer";
import { DELIVERY_STATUS } from "../../utils/constant";

const AwaitPickupDeliveries = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [warehouse, setWarehouse] = useState<Warehouse>();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery>();
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const showDrawer = () => {
    setIsVisible(true);
  };
  const onClose = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user._id) {
        return;
      }
      setLoading(true);
      const warehouseData = await getWarehouseByUserId(user._id);
      setWarehouse(warehouseData);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div>
      {!warehouse && loading ? (
        <TableSkeleton />
      ) : (
        <>
          {warehouse?._id ? (
            <>
              <DeliveryTable
                loading={loading}
                warehouseId={warehouse._id}
                reload={reload}
                showDrawer={showDrawer}
                setSelectedDelivery={setSelectedDelivery}
                setReload={setReload}
                setLoading={setLoading}
                key={warehouse._id}
                selectedDelivery={selectedDelivery}
                status={DELIVERY_STATUS.AWAITING_PICKUP}
              />
              <DeliveryDrawer
                onClose={onClose}
                selectedDelivery={selectedDelivery}
                reload={reload}
                setReload={setReload}
                setSelectedDelivery={setSelectedDelivery}
                visible={isVisible}
                key={selectedDelivery?._id}
                setLoading={setLoading}
                warehouseId={warehouse._id}
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

export default AwaitPickupDeliveries;
