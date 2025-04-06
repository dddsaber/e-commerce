import React, { useCallback, useEffect, useState } from "react";
import { StoreRevenue, StoreRevenueRequest } from "../../type/statistic.type";
import { getStoresRevenue } from "../../api/statistic.api";
import {
  Avatar,
  Button,
  Flex,
  Input,
  Select,
  Table,
  TableColumnsType,
  TablePaginationConfig,
  Tag,
} from "antd";
import { getSourceImage } from "../../utils/handle_image_func";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { debounce } from "lodash";
import TableSkeleton from "../layout/TableSkeleton";
import StoreRevenueChart from "./StoreRevenueChart";

interface StoreRevenueProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
  reload: boolean;
  setReload: (value: boolean) => void;
  data: StoreRevenue[];
  setData: (value: StoreRevenue[]) => void;
}

const StoreRevenueTable: React.FC<StoreRevenueProps> = ({
  loading,
  setLoading,
  reload,
  setReload,
  data,
  setData,
}) => {
  const [filter, setFilter] = useState<StoreRevenueRequest>({
    isActives: [true, false],
    settleds: [true, false],
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
        const response = await getStoresRevenue(filter);
        if (response) {
          setData(response);
        }
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: response.length,
        }));
      } catch (error) {
        console.log(error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reload, filter]);

  useEffect(() => {
    const newFilter: StoreRevenueRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      isActives: searchParams
        .get("isActives")
        ?.split(",")
        .map((val) => val === "true"),
      settleds: searchParams
        .get("settleds")
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
    };
    setFilter(newFilter);
  }, [searchParams]);

  const handleResearch = () => {
    setFilter({});
    setSearchParams(new URLSearchParams());
    setReload(!reload);
    setPagination({
      pageSize: 10,
      current: 1,
      total: 0,
    });
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
      sorter: SorterResult<StoreRevenue> | SorterResult<StoreRevenue>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        isActives: filters.isActive
          ? (filters.isActive as boolean[]).map((val) => val === true)
          : prevFilter.isActives,
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

      if (filters.isActive)
        newParams.set(
          "isActives",
          (filters.isActive as boolean[]).map((val) => val.toString()).join(",")
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

  const columns: TableColumnsType<StoreRevenue> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const, // Sử dụng 'as const' để ép kiểu thành 'center'
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      width: 80,
      align: "center" as const,
      render: (logo: string) => (
        <Avatar src={getSourceImage(logo) || "default.png"} />
      ),
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "name",
      key: "name",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Tổng giá trị đơn hàng",
      dataIndex: "total",
      key: "total",
      sorter: true,
      width: 150,
      align: "right" as const,
      render: (total: number) => (
        <span style={{ fontWeight: "bold" }}>
          {total.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      title: "Phí thanh toán",
      dataIndex: "totalTransaction",
      key: "totalTransaction",
      sorter: true,
      width: 150,
      align: "right" as const,
      render: (total: number) => <span>{total.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "Phí cố định",
      dataIndex: "totalCommission",
      key: "totalCommission",
      sorter: true,
      width: 150,
      align: "right" as const,
      render: (total: number) => <span>{total.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "Phí dịch vụ",
      dataIndex: "totalService",
      key: "totalService",
      sorter: true,
      width: 150,
      align: "right" as const,
      render: (total: number) => <span>{total.toLocaleString("vi-VN")} đ</span>,
    },
    {
      title: "Tổng phí giao dịch",
      key: "pdd",
      sorter: true,
      width: 150,
      align: "right" as const,
      render: (record: StoreRevenue) => (
        <span style={{ fontWeight: "bold" }}>
          {(
            record.totalTransaction +
            record.totalCommission +
            record.totalService
          ).toLocaleString("vi-VN")}{" "}
          đ
        </span>
      ),
    },
    {
      title: "Tổng doanh thu thực tế",
      key: "dttt",
      sorter: true,
      width: 150,
      align: "right" as const,
      render: (record: StoreRevenue) => (
        <span style={{ fontWeight: "bold" }}>
          {(
            record.total -
            (record.totalTransaction +
              record.totalCommission +
              record.totalService)
          ).toLocaleString("vi-VN")}{" "}
          đ
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      sorter: true,
      width: 120,
      filters: [
        { text: "Đang hoạt động", value: true },
        { text: "Đã khóa", value: false },
      ],
      filteredValue: filter.isActives,
      align: "center" as const,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"} key={isActive.toString()}>
          {isActive ? "Đang hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
  ];

  const handleSettledChange = (value: string) => {
    let settledValues;
    if (value === "all") {
      settledValues = [true, false]; // Chọn tất cả
    } else {
      settledValues = [value === "true"]; // Chỉ lấy giá trị tương ứng
    }

    setFilter((prev) => ({ ...prev, settleds: settledValues }));

    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete("settleds");
    } else {
      newParams.set("settleds", value);
    }
    setSearchParams(newParams);
  };

  return loading ? (
    <TableSkeleton />
  ) : (
    <>
      <Flex
        gap={10}
        justify="space-between"
        style={{
          marginBottom: 10,
          position: "sticky", // Giữ cố định nhưng vẫn nằm trong luồng bình thường
          top: 0, // Gắn sát mép trên
          backgroundColor: "white", // Màu nền của header
          zIndex: 1000, // Đảm bảo nó hiển thị trên các thành phần khác
          padding: "5px 5px 0 10px", // Thêm padding để không quá sát
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Flex gap={10}>
          <Input
            placeholder="Tìm kiếm cửa hàng"
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
        <Select
          defaultValue="all"
          style={{ width: 150 }}
          onChange={handleSettledChange}
          value={searchParams.get("settleds") || "all"}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="true">Đã kết toán</Select.Option>
          <Select.Option value="false">Chưa kết toán</Select.Option>
        </Select>
      </Flex>
      <StoreRevenueChart data={data} />
      <Table
        bordered
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="_id"
        scroll={{ x: "max-content" }}
        onChange={handleTableChange}
        pagination={{
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
          ...pagination,
        }}
        style={{ margin: "0 10px" }}
      />
    </>
  );
};

export default StoreRevenueTable;
