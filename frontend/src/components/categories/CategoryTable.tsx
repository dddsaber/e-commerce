import React, { useEffect, useState, useCallback } from "react";
import { GetCategoryRequest, Category } from "../../type/category.type";
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
  EditOutlined,
  LockOutlined,
  PlusCircleFilled,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { getCategories, updateCategoryStatus } from "../../api/category.api";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleError } from "../../utils/handle_error_func";
import { formatDate } from "../../utils/handle_format_func";
import TableSkeleton from "../layout/TableSkeleton";

interface CategoryTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedCategory: (category?: Category) => void;
  showDrawer: () => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  reload,
  setReload,
  setLoading,
  setSelectedCategory,
  showDrawer,
  loading,
}) => {
  const [data, setData] = useState<Category[]>([]);
  const [filter, setFilter] = useState<GetCategoryRequest>({
    isDeleteds: [true, false],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    pageSize: 10,
    current: 1,
    total: 0,
  });

  useEffect(() => {
    console.log(reload, filter);
    const fetchData = async () => {
      try {
        setLoading(true);
        const { categories, totalCategories } = await getCategories(filter);
        setData(categories);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: totalCategories,
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
    const newFilter: GetCategoryRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
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
    };
    setFilter(newFilter);
  }, [searchParams]);

  const handleStatus = async (record: Category) => {
    try {
      const response = await updateCategoryStatus(
        record._id,
        !record.isDeleted
      );
      if (response) {
        if (response.isDeleted) message.success("Category has been deleted!");
        else message.success("Category has been undeleted!");
        setReload(!reload);
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

  const handleEdit = (record: Category) => {
    setSelectedCategory(record);
    showDrawer();
  };

  const handleAdd = () => {
    setSelectedCategory(undefined);
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
      sorter: SorterResult<Category> | SorterResult<Category>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        isDeleteds: filters.isDeleted
          ? (filters.isDeleted as boolean[]).map((val) => val === true)
          : prevFilter.isDeleteds,
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
      if (filters.isDeleted)
        newParams.set(
          "isDeleteds",
          (filters.isDeleted as boolean[])
            .map((val) => val.toString())
            .join(",")
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

  const columns: TableColumnsType<Category> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const, // Sử dụng 'as const' để ép kiểu thành 'center'
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      sorter: true,
      width: 170,
      align: "left" as const,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      sorter: true,
      width: 200,
      align: "left" as const,
      render: (text) => (
        <div
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            WebkitLineClamp: 3, // Giới hạn số dòng là 4
            whiteSpace: "normal",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Danh mục cha",
      dataIndex: ["parentId", "name"],
      key: "parendId.name",
      width: 150,
      align: "left" as const,
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
      render: (_: unknown, record: Category) => (
        <Space size="middle">
          <Tooltip title={record.isDeleted ? "Khôi phục" : "Xóa"}>
            <Button
              type="text"
              onClick={() => handleStatus(record)}
              icon={!record.isDeleted ? <UnlockOutlined /> : <LockOutlined />}
            />
          </Tooltip>
          <Tooltip title="Sửa thông tin">
            <Button
              type="text"
              onClick={() => handleEdit(record)}
              icon={<EditOutlined />}
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
          <Flex
            gap={10}
            justify="space-between"
            style={{ marginBottom: 10, marginTop: 10 }}
          >
            <Flex gap={10}>
              <Input
                placeholder="Tìm kiếm danh mục"
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
              Thêm Danh mục
            </Button>
          </Flex>
          <Typography.Title style={{ textAlign: "right" }} level={5}>
            Total categories: {pagination.total}
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

export default CategoryTable;
