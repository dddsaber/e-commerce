import React, { useEffect, useState, useCallback } from "react";
import { GetOrdersRequest, Order } from "../../type/order.type";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Input,
  TablePaginationConfig,
  Flex,
  Typography,
  message,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { cancelOrder, getOrders, updateOrderStatus } from "../../api/order.api";
import { debounce } from "lodash";
import { handleError } from "../../utils/handle_error_func";
import { STATUS_MAP } from "../../utils/constant";
import StoreOrderCard from "./StoreOrderCard";

interface OrderTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedOrder: (order?: Order) => void;
  showDrawer: () => void;
  storeId?: string;
  status?: string;
  selectedOrder?: Order;
}

const OrdersDisplay: React.FC<OrderTableProps> = ({
  reload,
  setReload,
  setLoading,
  status,
  storeId,
  setSelectedOrder,
  selectedOrder,
}) => {
  const [cancelNote, setCancelNote] = useState<string>();
  const [isVisible, setIsVisible] = useState<boolean>();
  const [data, setData] = useState<Order[]>([]);
  const [filter, setFilter] = useState<GetOrdersRequest>({
    statuses: [],
    storeId: storeId,
    status: status,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    pageSize: 10,
    current: 1,
    total: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { orders, totalOrders } = await getOrders(filter);
        setData(orders);
        setPagination((prevPagination) => ({
          ...prevPagination, // Sao chép các giá trị cũ của pagination
          total: totalOrders, // Cập nhật total mới
        }));
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reload, filter]);

  useEffect(() => {
    const newFilter: GetOrdersRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      statuses: searchParams.get("statuses")?.split(","),
      sortBy: searchParams.get("sortBy")
        ? {
            field: searchParams.get("sortBy")?.split(":")[0] || "",
            order:
              (searchParams.get("sortBy")?.split(":")[1] as "asc" | "desc") ||
              "asc",
          }
        : undefined,
      storeId: storeId,
      status: status,
    };
    setFilter(newFilter);
  }, [searchParams]);

  const handleCancelOrder = async () => {
    console.log(selectedOrder, cancelNote);
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const response = await cancelOrder(selectedOrder?._id!, cancelNote);
    if (response) {
      message.success("Order has been canceled!");
      setReload(!reload);
      setIsVisible(false);
    }
  };

  const handleResearch = () => {
    setFilter({
      storeId: storeId,
      status: status,
    });
    setSearchParams(new URLSearchParams());
    setReload(!reload);
    setPagination({
      pageSize: 10,
      current: 1,
      total: 0,
    });
  };

  const handleConfirm = async (record: Order) => {
    const response = await updateOrderStatus(
      record._id!,
      STATUS_MAP.confirmed.value
    );
    if (response) {
      message.success(`Order ${record._id} has been confirmed!`);
      setReload(!reload);
    }
  };

  const debounceSearch = useCallback(
    debounce((value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("searchKey", value);
      } else {
        newParams.delete("searchKey");
      }
      if (storeId) {
        newParams.set("storeId", storeId);
      }
      if (status) {
        newParams.set("status", status);
      }
      setSearchParams(newParams);
    }, 500),
    [searchParams]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
      debounceSearch(e.target.value);
    },
    [debounceSearch]
  );

  return (
    <>
      <Flex
        gap={10}
        justify="space-between"
        style={{ marginBottom: 10, marginTop: 10 }}
      >
        <Flex gap={10}>
          <Input
            placeholder="Tìm kiếm bình luận"
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, width: 800 }}
          />
          <span> &nbsp;</span>
          <Button onClick={handleResearch}>
            <ReloadOutlined />
          </Button>
          <span> &nbsp;</span>
          <Button type="primary" onClick={() => setReload(!reload)}>
            <SearchOutlined />
          </Button>
        </Flex>
      </Flex>
      <Typography.Title level={5} style={{ textAlign: "right" }}>
        Total : {pagination.total}
      </Typography.Title>
      {data.map((order) => (
        <StoreOrderCard key={order._id} order={order} />
      ))}
    </>
  );
};

export default OrdersDisplay;
