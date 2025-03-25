import React, { useEffect, useState, useCallback } from "react";
import { GetCouponsRequest, Coupon } from "../../type/coupon.type";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  Input,
  TableColumnsType,
  TablePaginationConfig,
  Flex,
  message,
  Typography,
} from "antd";
import {
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  PlusCircleFilled,
  RedoOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  applyCouponToStore,
  getCoupons,
  updateCouponStatus,
} from "../../api/coupon.api";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleError } from "../../utils/handle_error_func";
import { formatDate } from "../../utils/handle_format_func";
import dayjs from "dayjs";
import { COUPON_SCOPE } from "../../utils/constant";
import { checkCouponApplied } from "../../utils/handle_status_func";
import TableSkeleton from "../layout/TableSkeleton";

interface CouponTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setSelectedCoupon: (coupon?: Coupon) => void;
  showDrawer: () => void;
  scope?: "all" | "specific";
  storeId?: string;
  loading: boolean;
}

const CouponTable: React.FC<CouponTableProps> = ({
  reload,
  setReload,
  setLoading,
  setSelectedCoupon,
  showDrawer,
  scope,
  storeId,
  loading,
}) => {
  const [data, setData] = useState<Coupon[]>([]);
  const [filter, setFilter] = useState<GetCouponsRequest>({
    isDeleteds: [true, false],
    scope: scope,
    storeId: scope === COUPON_SCOPE.specific ? storeId : undefined,
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
        const { coupons, totalCoupons } = await getCoupons(filter);
        setData(coupons);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: totalCoupons,
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
    const newFilter: GetCouponsRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      types: searchParams.get("types")?.split(","),
      isDeleteds: searchParams
        .get("isDeleteds")
        ?.split(",")
        .map((val) => val === "true"),
      sortBy: searchParams.get("sortBy")
        ? {
            field: searchParams.get("sortBy")?.split(":")[0] || "",
            order:
              (searchParams.get("sortBy")?.split(":")[1] as "asc" | "desc") ||
              "asc",
          }
        : undefined,
      scope: scope,
      storeId: scope === COUPON_SCOPE.specific ? storeId : undefined,
    };
    setFilter(newFilter);
  }, [searchParams]);

  const handleStatus = async (record: Coupon) => {
    try {
      const response = await updateCouponStatus(record._id, !record.isDeleted);
      if (response) {
        if (response.isDeleted) message.success("Coupon has been blocked!");
        else message.success("Coupon has been unblocked!");
        setReload(!reload);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setReload(!reload);
    }
  };

  const handleResearch = () => {
    setFilter({
      scope: scope,
      storeId: scope === COUPON_SCOPE.specific ? storeId : undefined,
    });
    setSearchParams(new URLSearchParams());
    setReload(!reload);
    setPagination({
      pageSize: 10,
      current: 1,
      total: 0,
    });
  };

  const handleEdit = (record: Coupon) => {
    setSelectedCoupon({
      ...record,
      appliedDate: dayjs(record.appliedDate),
      expirationDate: dayjs(record.expirationDate),
    });
    showDrawer();
  };

  const handleAddStoreToCoupon = async (record: Coupon) => {
    if (!storeId) return;
    const coupon = await applyCouponToStore(record._id, storeId);
    if (coupon) {
      message.success("Coupon has been applied to store!");
      setReload(!reload);
    }
  };

  const handleAdd = () => {
    setSelectedCoupon(undefined);
    showDrawer();
  };

  const debounceSearch = useCallback(
    debounce((value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("searchKey", value);
      } else {
        newParams.delete("searchKey");
      }
      if (scope) {
        newParams.set("scope", scope);
      }
      if (storeId && scope === COUPON_SCOPE.specific) {
        newParams.set("storeId", storeId);
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
      sorter: SorterResult<Coupon> | SorterResult<Coupon>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        isDeleteds: filters.isDeleted
          ? (filters.isDeleted as boolean[]).map((val) => val === true)
          : prevFilter.isDeleteds,
        types: filters.type ? (filters.type as string[]) : prevFilter.types,
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
      if (filters.type)
        newParams.set("types", (filters.type as string[]).join(","));

      if (filters.isDeleted)
        newParams.set(
          "isDeleteds",
          (filters.isDeleted as boolean[])
            .map((val) => val.toString())
            .join(",")
        );

      if (filter.scope) newParams.set("scope", filter.scope);

      if (filter.storeId && scope === COUPON_SCOPE.specific)
        newParams.set("storeId", filter.storeId);

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

  const columns: TableColumnsType<Coupon> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const, // Sử dụng 'as const' để ép kiểu thành 'center'
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên phiếu",
      dataIndex: "name",
      key: "name",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Kiểu",
      dataIndex: "type",
      key: "type",
      sorter: true,
      width: 170,
      align: "left" as const,
      filters: [
        { text: "Phần trăm (%)", value: "percentage" },
        { text: "Số cố định", value: "fixed" },
      ],
      filteredValue: filter.types,
      render: (type: string) => {
        const typesMap: { [key: string]: string } = {
          percentage: "Phần trăm (%)",
          fixed: "Số cố định",
        };
        return typesMap[type] || type;
      },
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Ngày áp dụng",
      dataIndex: "appliedDate",
      key: "appliedDate",
      sorter: true,
      width: 150,
      align: "left" as const,
      render: (appliedDate: Date) => formatDate(appliedDate),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expirationDate",
      key: "expirationDate",
      sorter: true,
      width: 150,
      align: "left" as const,
      render: (expirationDate: Date) => formatDate(expirationDate),
    },
    {
      title: "Trạng thái",
      dataIndex: "isDeleted",
      key: "isDeleted",
      sorter: true,
      width: 120,
      filters: [
        { text: "Tồn tại", value: false },
        { text: "Đã xóa", value: true },
      ],
      filteredValue: filter.isDeleteds,
      align: "center" as const,
      render: (_: unknown, { isDeleted }: { isDeleted: boolean }) => (
        <Tag color={isDeleted ? "red" : "green"} key={isDeleted.toString()}>
          {isDeleted ? "Đã xóa" : "Tồn tại"}
        </Tag>
      ),
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
      render: (_: unknown, record: Coupon) => (
        <Space size="middle">
          <Tooltip title={!record.isDeleted ? "Xóa" : "Khôi phục"}>
            <Button
              type="text"
              onClick={() => handleStatus(record)}
              icon={!record.isDeleted ? <DeleteOutlined /> : <RedoOutlined />}
            />
          </Tooltip>
          {scope === COUPON_SCOPE.specific && storeId ? (
            <>
              <Tooltip title="Sửa thông tin">
                <Button
                  type="text"
                  onClick={() => handleEdit(record)}
                  icon={<EditOutlined />}
                />
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Áp dụng mã lên cửa hàng">
                <Button
                  type="text"
                  onClick={() => handleAddStoreToCoupon(record)}
                  icon={<CheckCircleFilled />}
                  style={{
                    color: checkCouponApplied(record, storeId!)
                      ? "green"
                      : "black",
                  }}
                />
              </Tooltip>
            </>
          )}
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
          <Flex
            gap={10}
            justify="space-between"
            style={{ marginBottom: 10, marginTop: 10 }}
          >
            <Flex gap={10}>
              <Input
                placeholder="Tìm kiếm người dùng"
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

            <Button
              type="primary"
              icon={<PlusCircleFilled />}
              onClick={() => handleAdd()}
            >
              Thêm phiếu
            </Button>
          </Flex>
          <Typography.Title level={5} style={{ textAlign: "right" }}>
            Tổng số bản ghi : {pagination.total}
          </Typography.Title>
          <Table
            bordered
            columns={columns}
            dataSource={data}
            pagination={pagination}
            rowKey="name"
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        </>
      )}
    </>
  );
};

export default CouponTable;
