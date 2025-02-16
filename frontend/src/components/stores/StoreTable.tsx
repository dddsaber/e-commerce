import React, { useCallback, useEffect, useState } from "react";
import { GetStoresRequest, Store } from "../../type/store.type";
import { useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Flex,
  Input,
  message,
  Space,
  Table,
  TableColumnsType,
  TablePaginationConfig,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { getStores, updateStoreStatus } from "../../api/store.api";
import { handleError } from "../../utils/handle_error_func";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import {
  EditOutlined,
  LockOutlined,
  PlusCircleFilled,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { getSourceImage } from "../../utils/handle_image_func";
import { formatDate } from "../../utils/handle_format_func";
interface StoreTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedStore: (store?: Store) => void;
  showDrawer: () => void;
}
const StoreTable: React.FC<StoreTableProps> = ({
  reload,
  setReload,
  loading,
  setLoading,
  setSelectedStore,
  showDrawer,
}) => {
  const [data, setData] = useState<Store[]>([]);
  const [filter, setFilter] = useState<GetStoresRequest>({
    isActives: [true, false],
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
        const { stores, totalStores } = await getStores(filter);
        setData(stores);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: totalStores,
        }));

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [reload, filter]);

  useEffect(() => {
    const newFilter: GetStoresRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      isActives: searchParams
        .get("isActives")
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

  const handleStatus = async (record: Store) => {
    try {
      const response = await updateStoreStatus(record._id, !record.isActive);
      if (response) {
        if (response.isActive) message.success("Store has been unblocked!");
        else message.success("Store has been blocked!");
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

  const handleEdit = (record: Store) => {
    setSelectedStore(record);
    showDrawer();
  };

  const handleAdd = () => {
    setSelectedStore(undefined);
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
      sorter: SorterResult<Store> | SorterResult<Store>[]
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
  const columns: TableColumnsType<Store> = [
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
      title: "Chủ cửa hàng",
      dataIndex: ["user", "name"],
      key: "user.name",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Tên tài khoản",
      dataIndex: ["user", "username"],
      key: "user.username",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 170,
      align: "left" as const,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      width: 200,
      ellipsis: true,
      align: "left" as const,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      sorter: true,
      width: 200,
      align: "left" as const,
      render: (address: { province: string; district: string; ward: string }) =>
        `${address?.province || ""}, ${address?.district || ""}, ${
          address?.ward || ""
        }`,
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
      render: (_: unknown, { isActive }: { isActive: boolean }) => (
        <Tag color={isActive ? "green" : "red"} key={isActive.toString()}>
          {isActive ? "Đang hoạt động" : "Đã khóa"}
        </Tag>
      ),
    },
    {
      title: "Thống kê",
      dataIndex: "statistics",
      key: "statistics",
      width: 200,
      align: "center" as const,
      render: (statistics: {
        totalProducts: number;
        monthlyRevenue: number;
      }) => (
        <div>
          <p>Sản phẩm: {statistics.totalProducts}</p>
          <p>Doanh thu tháng: {statistics.monthlyRevenue}</p>
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      align: "left" as const,
      render: (time) => formatDate(time),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      align: "left" as const,
      render: (time) => formatDate(time),
    },
    {
      title: "Hành động",
      fixed: "right" as const,
      align: "center" as const,
      width: 150,
      render: (_: unknown, record: Store) => (
        <Space size="middle">
          <Tooltip
            title={record.isActive ? "Khóa cửa hàng" : "Mở khóa cửa hàng"}
          >
            <Button
              type="text"
              onClick={() => handleStatus(record)}
              icon={record.isActive ? <UnlockOutlined /> : <LockOutlined />}
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
      <Flex
        gap={10}
        justify="space-between"
        style={{
          margin: "10px 0 ",
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
        <Typography.Title level={5}>
          Total stores: {pagination.total}
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusCircleFilled />}
          onClick={() => handleAdd()}
        >
          Thêm cửa hàng
        </Button>
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

export default StoreTable;
