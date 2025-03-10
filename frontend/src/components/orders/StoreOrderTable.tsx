import React, { useEffect, useState, useCallback } from "react";
import { GetOrdersRequest, Order, OrderDetails } from "../../type/order.type";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Space,
  Table,
  Tooltip,
  Input,
  TableColumnsType,
  TablePaginationConfig,
  Flex,
  Typography,
  Tag,
  Image,
  message,
  Modal,
} from "antd";
import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseCircleFilled,
  CloseCircleOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { cancelOrder, getOrders, updateOrderStatus } from "../../api/order.api";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleError } from "../../utils/handle_error_func";
import { STATUS_MAP } from "../../utils/constant";
import { getSourceImage } from "../../utils/handle_image_func";
import { checkStatus } from "../../utils/handle_status_func";

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

const StoreOrderTable: React.FC<OrderTableProps> = ({
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

  const handleStatus = async (record: Order) => {
    try {
      console.log(record);
    } catch (error) {
      handleError(error);
    } finally {
      setReload(!reload);
    }
  };

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

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<Order> | SorterResult<Order>[]
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
      if (filters.reportCategory)
        newParams.set(
          "reportCategories",
          (filters.reportCategory as string[]).join(",")
        );

      if (filter.storeId) newParams.set("storeId", filter.storeId);

      if (filter.status) newParams.set("status", filter.status);

      if (filters.rating)
        newParams.set("ratings", (filters.rating as number[]).join(","));

      if (filters.isDeleted)
        newParams.set(
          "isDeleteds",
          (filters.isDeleted as boolean[])
            .map((val) => val.toString())
            .join(",")
        );

      if (filters.isHandle)
        newParams.set(
          "isHandles",
          (filters.isHandle as boolean[]).map((val) => val.toString()).join(",")
        );

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

  const columns: TableColumnsType<Order> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 10,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Mã đơn",
      dataIndex: "_id",
      key: "_id",
      sorter: true,
      width: 200,
      align: "left" as const,
    },
    {
      title: "Người mua",
      dataIndex: ["user", "name"],
      key: "user.name",
      sorter: true,
      width: 150,
      ellipsis: true,
      align: "right" as const,
    },
    {
      title: "Số sản phẩm",
      dataIndex: "orderDetails",
      key: "orderDetails",
      sorter: true,
      width: 50,
      ellipsis: true,
      align: "center" as const,
      render: (orderDetails: OrderDetails[]) => orderDetails.length || 0,
    },
    {
      title: "Phí vận chuyển",
      dataIndex: "shippingFee",
      key: "shippingFee",
      sorter: true,
      width: 100,
      ellipsis: true,
      align: "center" as const,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      sorter: true,
      width: 120,
      ellipsis: true,
      align: "center" as const,
    },
    {
      title: "Phương thức TT",
      dataIndex: ["payment", "name"],
      key: "payment.name",
      sorter: true,
      width: 180,
      ellipsis: true,
      align: "right" as const,
    },
    {
      title: "Trạng thái",
      dataIndex: "status", // Đúng với dữ liệu từ backend
      key: "status",
      sorter: true,
      width: 120,
      align: "center" as const,
      filters: [
        { text: STATUS_MAP.pending.label, value: STATUS_MAP.pending.value },
        { text: STATUS_MAP.confirmed.label, value: STATUS_MAP.confirmed.value },
        { text: STATUS_MAP.shipped.label, value: STATUS_MAP.shipped.value },
        { text: STATUS_MAP.delivered.label, value: STATUS_MAP.delivered.value },
        { text: STATUS_MAP.cancelled.label, value: STATUS_MAP.cancelled.value },
        { text: STATUS_MAP.completed.label, value: STATUS_MAP.completed.value },
      ],
      filteredValue: filter.statuses || null, // Nếu không có filter, tránh lỗi undefined
      onFilter: (value, record) => record.status === value, // Lọc client-side nếu cần
      render: (status: string) => {
        const statusInfo = STATUS_MAP[status as keyof typeof STATUS_MAP];
        return <Tag color={statusInfo?.color}>{statusInfo?.label}</Tag>;
      },
    },

    {
      title: "Hành động",
      fixed: "right" as const,
      align: "center" as const,
      width: 150,
      render: (_: unknown, record: Order) => (
        <Space size="middle">
          <Tooltip title={record.isDeleted ? "Khôi phục" : "Xóa"}>
            <Button
              type="text"
              onClick={() => handleStatus(record)}
              icon={!record.isDeleted ? <UnlockOutlined /> : <LockOutlined />}
            />
          </Tooltip>
          <Tooltip title="Xác nhận đơn hàng">
            <Button
              type="text"
              onClick={() => handleConfirm(record)}
              icon={
                record.status === STATUS_MAP.pending.value ||
                record.status === STATUS_MAP.cancelled.value ? (
                  <CheckCircleOutlined />
                ) : (
                  <CheckCircleFilled />
                )
              }
              disabled={!(record.status === STATUS_MAP.pending.value)}
              style={{
                color: "green",
              }}
            />
          </Tooltip>
          <Tooltip title="Hủy đơn hàng">
            <Button
              type="text"
              onClick={() => {
                setSelectedOrder(record);
                setIsVisible(true);
              }}
              icon={
                checkStatus(record?.status) ? (
                  <CloseCircleOutlined />
                ) : (
                  <CloseCircleFilled />
                )
              }
              disabled={!(record.status === STATUS_MAP.pending.value)}
              style={{
                color: "red",
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const itemColumns: TableColumnsType<OrderDetails> = [
    {
      title: "Ảnh",
      dataIndex: ["product", "image"],
      key: "product.image",
      width: 60,
      align: "center" as const,
      render: (image: string) => (
        <Image
          style={{ width: 75, height: 75 }}
          src={getSourceImage(image) || "default.jpg"}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: ["product", "name"],
      key: "product.name",
      width: 300,
      align: "left" as const,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 100,
      align: "center" as const,
      render: (price: number) => `${price} đ`,
    },
    {
      title: "Giảm",
      dataIndex: "discount",
      key: "discount",
      width: 100,
      align: "center" as const,
      render: (discount: number) => `${discount * 100} %`,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center" as const,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      render: (text, record) => {
        let total;
        if (!record.price || !record.quantity) {
          total = 0;
        } else {
          total = record.price * record.quantity * (1 - (record.discount ?? 0));
        }
        return `${total.toFixed(2)} đ`;
      },
    },
  ];

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
      <Table
        rowKey={(record) => record._id || "index"}
        bordered
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ overflowX: "auto", width: "100%" }}>
              <Table
                rowKey={(record) => record._id || "index"}
                columns={itemColumns}
                dataSource={record.orderDetails}
                size="small"
                pagination={false}
                showHeader={false}
                style={{ minWidth: "1000px" }} // Đảm bảo bảng con đủ rộng
              />
            </div>
          ),
        }}
      />
      <Modal
        open={isVisible}
        title="Hủy đơn hàng"
        onOk={handleCancelOrder}
        onCancel={() => {
          setIsVisible(false);
        }}
        destroyOnClose
        cancelText="Hủy"
        style={{ top: 10, width: 700 }}
        width={700}
      >
        <Typography.Text style={{ color: "red" }}>
          Bạn có chắc chắn muốn hủy đơn hàng này?
        </Typography.Text>
        <Input
          placeholder="Lí do hủy đơn hàng"
          value={cancelNote}
          onChange={(e) => setCancelNote(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default StoreOrderTable;
