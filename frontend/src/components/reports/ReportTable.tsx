import React, { useEffect, useState, useCallback } from "react";
import { GetReportsRequest, Report } from "../../type/report.type";
import { Link, useSearchParams } from "react-router-dom";
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
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { getReports, updateReportStatus } from "../../api/report.api";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleError } from "../../utils/handle_error_func";
import { formatDate } from "../../utils/handle_format_func";

interface ReportTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedReport: (report?: Report) => void;
  showDrawer: () => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  reload,
  setReload,
  loading,
  setLoading,
  setSelectedReport,
  showDrawer,
}) => {
  const [data, setData] = useState<Report[]>([]);
  const [filter, setFilter] = useState<GetReportsRequest>({
    isDeleteds: [true, false],
    isHandles: [true, false],
    reportCategories: ["User", "Store", "Product", "Review"],
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
        const { reports, totalReports } = await getReports(filter);
        setData(reports);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: totalReports,
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
    const newFilter: GetReportsRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      isHandles: searchParams
        .get("isHandles")
        ?.split(",")
        .map((val) => val === "true"),
      isDeleteds: searchParams
        .get("isDeleteds")
        ?.split(",")
        .map((val) => val === "true"),
      reportCategories: searchParams.get("reportCategories")?.split(","),
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

  const handleStatus = async (record: Report) => {
    try {
      const response = await updateReportStatus(record._id, !record.isDeleted);
      if (response) {
        if (!response.isDeleted) message.success("Report has been unblocked!");
        else message.success("Report has been blocked!");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setReload(!reload);
    }
  };

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

  const handleEdit = (record: Report) => {
    setSelectedReport(record);
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
      sorter: SorterResult<Report> | SorterResult<Report>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        reportCategories: filters.reportCategory
          ? (filters.reportCategory as string[])
          : prevFilter.reportCategories,
        isDeleteds: filters.isDeleted
          ? (filters.isDeleted as boolean[]).map((val) => val === true)
          : prevFilter.isDeleteds,
        isHandles: filters.isHandle
          ? (filters.isHandle as boolean[]).map((val) => val === true)
          : prevFilter.isHandles,
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

  const columns: TableColumnsType<Report> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: true,
      width: 150,
      align: "left" as const, // Hoặc 'right', 'center' tùy theo yêu cầu
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      sorter: true,
      width: 300,
      align: "left" as const,
      ellipsis: true,
      render: (text) => (
        <div
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            WebkitLineClamp: 4, // Giới hạn số dòng là 4
            whiteSpace: "normal",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Mã người dùng",
      dataIndex: "userId",
      key: "userId",
      sorter: true,
      width: 200,
      ellipsis: true,
      align: "left" as const,
    },
    {
      title: "Mã quản trị",
      dataIndex: "adminId",
      key: "adminId",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Đưòng dẫn",
      dataIndex: "linkTo",
      key: "linkTo",
      sorter: true,
      width: 150,
      align: "left" as const,
      render: (linkTo: string) => <Link to={linkTo} />,
    },
    {
      title: "Danh mục",
      dataIndex: "reportCategory",
      key: "reportCategory",
      sorter: true,
      width: 150,
      align: "left" as const,
      filters: [
        { text: "Người dùng", value: "User" },
        { text: "Cửa hàng", value: "Store" },
        { text: "Sản phẩm", value: "Product" },
        { text: "Bình luận", value: "Review" },
      ],
      filteredValue: filter.reportCategories,
      render: (reportCategory: string) => {
        const reportCategoryMap: { [key: string]: string } = {
          User: "Người dùng",
          Store: "Cửa hàng",
          Product: "Sản phẩm",
          Review: "Bình luận",
        };
        return reportCategoryMap[reportCategory] || reportCategory;
      },
    },
    {
      title: "Mã báo cáo",
      dataIndex: "reportedId",
      key: "reportedId",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Xử lý",
      dataIndex: "isHandle",
      key: "isHandle",
      sorter: true,
      width: 120,
      filters: [
        { text: "Đã xử lý", value: true },
        { text: "Chưa xử lý", value: false },
      ],
      filteredValue: filter.isHandles,
      align: "center" as const,
      render: (_: unknown, { isHandle }: { isHandle: boolean }) => (
        <Tag color={isHandle ? "blue" : "orange"} key={isHandle.toString()}>
          {isHandle ? "Đã xử lý" : "Chưa xử lý"}
        </Tag>
      ),
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
      render: (_: unknown, record: Report) => (
        <Space size="middle">
          <Tooltip title={record.isDeleted ? "Khôi phục" : "Xóa"}>
            <Button
              type="text"
              onClick={() => handleStatus(record)}
              icon={!record.isDeleted ? <UnlockOutlined /> : <LockOutlined />}
            />
          </Tooltip>
          <Tooltip title="Xem thông tin">
            <Button
              type="text"
              onClick={() => handleEdit(record)}
              icon={<EyeOutlined />}
            />
          </Tooltip>
        </Space>
      ),
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
            placeholder="Tìm kiếm báo cáo"
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
        <Typography.Title level={5}>
          Total reports: {pagination.total}
        </Typography.Title>
      </Flex>
      <Table
        bordered
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        rowKey="username"
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
      />
    </>
  );
};

export default ReportTable;
