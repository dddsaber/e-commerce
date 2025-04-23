import React, { useEffect, useState, useCallback } from "react";
import { GetPayoutsRequest, Payout } from "../../type/payout.type";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Space,
  Table,
  Tooltip,
  TableColumnsType,
  TablePaginationConfig,
} from "antd";
import { EyeFilled, ReloadOutlined } from "@ant-design/icons";
import { getPayouts } from "../../api/store.api";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleError } from "../../utils/handle_error_func";
import { formatDate } from "../../utils/handle_format_func";
import TableSkeleton from "../layout/TableSkeleton";

interface PayoutTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedPayout: (payout?: Payout) => void;
  showDrawer: () => void;
  storeId?: string;
}

const PayoutTable: React.FC<PayoutTableProps> = ({
  reload,
  setReload,
  loading,
  setLoading,
  setSelectedPayout,
  storeId,
  showDrawer,
}) => {
  const [data, setData] = useState<Payout[]>([]);
  const [filter, setFilter] = useState<GetPayoutsRequest>({
    storeId: storeId ?? undefined,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    pageSize: 10,
    current: 1,
    total: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { payouts, totalPayouts } = await getPayouts(filter);
        setData(payouts);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: totalPayouts,
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
    const newFilter: GetPayoutsRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      sortBy: searchParams.get("sortBy")
        ? {
            field: searchParams.get("sortBy")?.split(":")[0] || "",
            order:
              (searchParams.get("sortBy")?.split(":")[1] as "asc" | "desc") ||
              "asc",
          }
        : undefined,
      storeId: storeId ?? undefined,
    };
    setFilter(newFilter);
  }, [searchParams]);

  const handleResearch = () => {
    setFilter({
      storeId: storeId ?? undefined,
    });
    setSearchParams(new URLSearchParams());
    setReload(!reload);
    setPagination({
      pageSize: 10,
      current: 1,
      total: 0,
    });
  };

  const handleTableChange = useCallback(
    (
      pagination: TablePaginationConfig,
      filters: Record<string, FilterValue | null>,
      sorter: SorterResult<Payout> | SorterResult<Payout>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,

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

      if (filter.storeId) newParams.set("storeId", filter.storeId);

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

  const columns: TableColumnsType<Payout> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const, // Sử dụng 'as const' để ép kiểu thành 'center'
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Mã cửa hàng",
      dataIndex: "storeId",
      key: "storeId",
      width: 70,
      align: "center" as const,
    },
    {
      title: "Số đơn hàng",
      dataIndex: "orders",
      key: "orders",
      width: 70,
      align: "center" as const, // Sử dụng 'as const' để ép kiểu thành 'center'
      render: (orders: string[]) => orders.length,
    },
    {
      title: "Số tiền kết toán",
      dataIndex: "totalPayout",
      key: "totalPayout",
      width: 70,
      align: "center" as const,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      width: 160,
      align: "left" as const,
      render: (time) => formatDate(time),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: true,
      width: 160,
      align: "left" as const,
      render: (time) => formatDate(time),
    },
    {
      title: "Hành động",
      fixed: "right" as const,
      align: "center" as const,
      width: 150,
      render: (_: unknown, record: Payout) => (
        <Space size="middle">
          <Tooltip title="Xem thông tin">
            <Button
              type="text"
              icon={<EyeFilled />}
              onClick={() => {
                setSelectedPayout(record);
                showDrawer();
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <Button
            type="primary"
            style={{ margin: 10, float: "right" }}
            onClick={handleResearch}
            icon={<ReloadOutlined />}
          />

          <Table
            bordered
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} bản ghi`,
              ...pagination,
            }}
            style={{ margin: "10px 10px" }}
            rowKey="_id"
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        </>
      )}
    </>
  );
};

export default PayoutTable;
