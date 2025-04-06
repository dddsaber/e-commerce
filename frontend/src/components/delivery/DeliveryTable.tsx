import React, { useCallback, useEffect, useState } from "react";
import { Delivery, GetDeliveryRequest } from "../../type/order.type";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  message,
  Space,
  Table,
  TableColumnsType,
  TablePaginationConfig,
  Tag,
  Tooltip,
} from "antd";
import { getDeliveries, updateTimeStamp } from "../../api/delivery.api";
import { handleError } from "../../utils/handle_error_func";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import {
  DELIVERY_STATUS_MAP,
  NOTIFICATION_TARGET_MODEL,
  NOTIFICATION_TYPE,
  STATUS_MAP,
} from "../../utils/constant";
import { formatDate } from "../../utils/handle_format_func";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  EyeOutlined,
  TruckFilled,
  TruckOutlined,
} from "@ant-design/icons";
import {
  checkDeliveryStatus,
  isDeliveryCompleted,
  isFirstLog,
} from "../../utils/handle_status_func";
import { updateOrderStatus } from "../../api/order.api";
import TableHeader from "../layout/TableHeader";
import { createNotification } from "../../api/notification.api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface DeliveryProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedDelivery: (delivery?: Delivery) => void;
  showDrawer: () => void;
  warehouseId?: string;
  status?: string;
  selectedDelivery?: Delivery;
  includeAll?: boolean;
}
const DeliveryTable: React.FC<DeliveryProps> = ({
  reload,
  setReload,
  setLoading,
  setSelectedDelivery,
  showDrawer,
  warehouseId,
  status,
  loading,
  includeAll = false,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [data, setData] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<GetDeliveryRequest>({
    statuses: [],
    warehouseId: warehouseId,
    includeAll: includeAll,
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

        const { deliveries, totalDeliveries } = await getDeliveries(filter);
        setData(deliveries);
        console.log(deliveries);
        setPagination((prevPagination) => ({
          ...prevPagination, // Sao chép các giá trị cũ của pagination
          total: totalDeliveries, // Cập nhật total mới
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
    const newFilter: GetDeliveryRequest = {
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
      warehouseId: warehouseId,
      includeAll: includeAll,
      status: status,
    };
    setFilter(newFilter);
  }, [searchParams]);

  const handleResearch = () => {
    setFilter({
      warehouseId: warehouseId,
      includeAll: includeAll,
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

  const handleView = (record: Delivery) => {
    setSelectedDelivery(record);
    showDrawer();
  };

  const handleConfirm = async (record: Delivery) => {
    if (!checkDeliveryStatus(warehouseId!, record)) {
      return;
    }
    if (isFirstLog(warehouseId!, record)) {
      const response = await updateOrderStatus(
        record.orderId,
        STATUS_MAP.shipped.value
      );
      await updateTimeStamp(record._id, warehouseId!);
      const notification = await createNotification({
        userId: response.userId!,
        createdBy: user._id,
        title: NOTIFICATION_TYPE.ORDER_UPDATE.label,
        message: `Đơn hàng ${response._id} đã được cập nhật sang trạng thái${
          STATUS_MAP[response.status as keyof typeof STATUS_MAP].label
        }`,
        target: response._id!,
        targetModel: NOTIFICATION_TARGET_MODEL.ORDER,
        image: response?.orderDetails[0].product?.image,
      });
      if (!notification) {
        message.error("Tạo thông báo thất bại!");
      }
    } else {
      await updateTimeStamp(record._id, warehouseId!);
    }
    setReload(!reload);
  };

  const handleDelivery = async (record: Delivery) => {
    if (!isDeliveryCompleted(warehouseId!, record)) {
      return;
    }
    const response = await updateOrderStatus(
      record.orderId,
      STATUS_MAP.delivered.value
    );
    const notification = await createNotification({
      userId: response.userId!,
      createdBy: user._id,
      title: NOTIFICATION_TYPE.ORDER_UPDATE.label,
      message: `Đơn hàng ${record._id} đã được ${
        STATUS_MAP[record.status as keyof typeof STATUS_MAP]
      }`,
      target: record._id!,
      targetModel: NOTIFICATION_TARGET_MODEL.ORDER,
      image: response?.orderDetails[0].product?.image,
    });
    if (!notification) {
      message.error("Tạo thông báo thất bại!");
    }
    setReload(!reload);
  };

  const debounceSearch = useCallback(
    debounce((value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("searchKey", value);
      } else {
        newParams.delete("searchKey");
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

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<Delivery> | SorterResult<Delivery>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        statuses: filters.status
          ? (filters.status as string[])
          : prevFilter.statuses,
        skip: ((pagination.current || 1) - 1) * (pagination.pageSize || 10),
        limit: pagination.pageSize || 10,
        sortBy: Array.isArray(sorter)
          ? undefined
          : sorter.columnKey
          ? {
              field: sorter.columnKey as string,
              order: sorter.order === "ascend" ? "asc" : "desc",
            }
          : prevFilter.sortBy,
      }));

      const newParams = new URLSearchParams();
      if (filter.status) newParams.set("status", filter.status);

      if (filter.includeAll)
        newParams.set("includeAll", `${filter.includeAll}`);

      if (filter.warehouseId) {
        newParams.set("warehouseId", filter.warehouseId);
      }

      if (filter.includeAll) {
        newParams.set("includeAll", `${filter.includeAll}`);
      }

      if (pagination.current)
        newParams.set(
          "skip",
          String((pagination.current - 1) * (pagination.pageSize || 10))
        );
      if (pagination.pageSize)
        newParams.set("limit", String(pagination.pageSize));
      if (!Array.isArray(sorter) && sorter.columnKey) {
        newParams.set(
          "sortBy",
          `${sorter.columnKey}:${sorter.order === "ascend" ? "asc" : "desc"}`
        );
      }

      setSearchParams(newParams);
    },
    [setSearchParams]
  );

  const columns: TableColumnsType<Delivery> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      fixed: "left",
      width: 50,
      align: "center",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Mã vận đơn",
      dataIndex: "_id",
      key: "_id",
      sorter: true,
      width: 200,
      align: "left",
    },
    {
      title: "Người nhận",
      dataIndex: "recipientName",
      key: "recipientName",
      sorter: true,
      width: 150,
      align: "left",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
      width: 120,
      align: "center",
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "address",
      key: "address",
      sorter: false,
      width: 300,
      align: "left",
      render: (address) =>
        `${address.details || ""}, ${address.ward}, ${address.district}, ${
          address.province
        }`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: true,
      width: 150,
      align: "center",
      filters: Object.values(DELIVERY_STATUS_MAP).map(({ label, value }) => ({
        text: label,
        value,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const statusInfo =
          DELIVERY_STATUS_MAP[status as keyof typeof DELIVERY_STATUS_MAP];
        return <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>;
      },
    },
    {
      title: "Phí vận chuyển",
      dataIndex: "shippingFee",
      key: "shippingFee",
      sorter: true,
      width: 120,
      align: "center",
      render: (fee: number) => `${fee.toLocaleString()} đ`,
    },
    {
      title: "Tiền COD",
      dataIndex: "codAmount",
      key: "codAmount",
      sorter: true,
      width: 120,
      align: "center",
      render: (amount: number) => `${amount.toLocaleString()} đ`,
    },
    {
      title: "Ngày dự kiến giao",
      dataIndex: "estimatedDate",
      key: "estimatedDate",
      sorter: true,
      width: 160,
      align: "center",
      render: (date) => formatDate(date),
    },
    {
      title: "Ngày giao thực tế",
      dataIndex: "deliveredDate",
      key: "deliveredDate",
      sorter: true,
      width: 160,
      align: "center",
      render: (date) => (date ? formatDate(date) : "Chưa giao"),
    },
    {
      title: "Hành động",
      fixed: "right",
      align: "center",
      width: 150,
      render: (_: unknown, record: Delivery) => {
        const canConfirm = checkDeliveryStatus(warehouseId!, record);
        const canDeliver = isDeliveryCompleted(warehouseId!, record);

        return (
          <Space size="middle">
            {/* Đánh dấu đã giao hàng */}
            <Tooltip title="Đánh dấu đã giao hàng">
              <Button
                type="text"
                onClick={() => handleDelivery(record)}
                icon={
                  record.status === STATUS_MAP.delivered.value ? (
                    <CheckCircleFilled style={{ color: "blue" }} />
                  ) : canDeliver ? (
                    <CheckCircleOutlined style={{ color: "blue" }} />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                disabled={!canDeliver}
              />
            </Tooltip>

            {/* Đánh dấu đã nhận đơn */}
            <Tooltip title="Đánh dấu đã nhận đơn">
              <Button
                type="text"
                onClick={() => handleConfirm(record)}
                icon={
                  record.deliveryLogs.some(
                    (log) => log.location === warehouseId && log.timestamp
                  ) ? (
                    <TruckFilled style={{ color: "green" }} />
                  ) : canConfirm ? (
                    <TruckOutlined style={{ color: "green" }} />
                  ) : (
                    <TruckOutlined />
                  )
                }
                disabled={!canConfirm}
              />
            </Tooltip>

            {/* Xem chi tiết */}
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                onClick={() => handleView(record)}
                icon={<EyeOutlined />}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <TableHeader
        handleResearch={handleResearch}
        handleSearchChange={handleSearchChange}
        reload={reload}
        searchValue={searchValue}
        setReload={setReload}
        key={warehouseId}
      />

      <Table
        rowKey={(record) => record._id || "index"}
        bordered
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
          ...pagination,
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        style={{ margin: "0 10px" }}
      />
    </div>
  );
};

export default DeliveryTable;
