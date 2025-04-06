import React, { useEffect, useState, useCallback } from "react";
import { GetUsersRequest, User } from "../../type/user.type";
import { useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Space,
  Table,
  Tag,
  Tooltip,
  TableColumnsType,
  TablePaginationConfig,
  message,
} from "antd";
import { EditOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { getUsers, updateUserStatus } from "../../api/user.api";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import dayjs from "dayjs";
import { handleError } from "../../utils/handle_error_func";
import { getSourceImage } from "../../utils/handle_image_func";
import { formatDate } from "../../utils/handle_format_func";
import TableHeader from "../layout/TableHeader";
import TableSkeleton from "../layout/TableSkeleton";

interface UserTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedUser: (user?: User) => void;
  showDrawer: () => void;
}

const UserTable: React.FC<UserTableProps> = ({
  reload,
  setReload,
  loading,
  setLoading,
  setSelectedUser,
  showDrawer,
}) => {
  const [data, setData] = useState<User[]>([]);
  const [filter, setFilter] = useState<GetUsersRequest>({
    isActives: [true, false],
    roles: ["user", "shipper", "admin", "sales"],
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
        const { users, totalUsers } = await getUsers(filter);
        setData(users);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: totalUsers,
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
    const newFilter: GetUsersRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      roles: searchParams.get("roles")?.split(","),
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

  const handleStatus = async (record: User) => {
    try {
      const response = await updateUserStatus(record._id, !record.isActive);
      if (response) {
        if (response.isActive) message.success("User has been unblocked!");
        else message.success("User has been blocked!");
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

  const handleEdit = (record: User) => {
    setSelectedUser({ ...record, birthday: dayjs(record.birthday) });
    showDrawer();
  };

  const handleAdd = () => {
    setSelectedUser(undefined);
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
      sorter: SorterResult<User> | SorterResult<User>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        roles: filters.role ? (filters.role as string[]) : prevFilter.roles,
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
      if (filters.role)
        newParams.set("roles", (filters.role as string[]).join(","));

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

  const columns: TableColumnsType<User> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const, // Sử dụng 'as const' để ép kiểu thành 'center'
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "avatar",
      key: "avatar",
      width: 60,
      align: "center" as const, // Sử dụng 'as const'
      render: (avatar: string) => (
        <Avatar src={getSourceImage(avatar) || "default.jpg"} />
      ),
    },
    {
      title: "Mã người dùng",
      dataIndex: "_id",
      key: "_id",
      sorter: true,
      width: 170,
      align: "left" as const,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      sorter: true,
      width: 150,
      align: "left" as const, // Hoặc 'right', 'center' tùy theo yêu cầu
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
      sorter: true,
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
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Provider ID",
      dataIndex: "providerId",
      key: "providerId",
      width: 150,
      align: "left" as const,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      sorter: true,
      width: 120,
      align: "center" as const,
      render: (gender: boolean) => (gender ? "Nam" : "Nữ"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      key: "birthday",
      sorter: true,
      width: 150,
      align: "center" as const,
      render: (birthday: Date) =>
        birthday ? new Date(birthday).toLocaleDateString() : "",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      sorter: true,
      width: 150,
      align: "left" as const,
      render: (address: {
        province: string;
        district: string;
        ward: string;
        details: string;
      }) =>
        `${address?.province || ""}, ${address?.district || ""}, ${
          address?.ward || ""
        }, ${address?.details || ""}`,
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
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      sorter: true,
      width: 150,
      align: "left" as const,
      filters: [
        { text: "Người dùng", value: "user" },
        { text: "Shipper", value: "shipper" },
        { text: "Quản trị viên", value: "admin" },
        { text: "Sales", value: "sales" },
        { text: "Người quản lý kho", value: "logistic_provider" },
      ],
      filteredValue: filter.roles, // Sử dụng filter.roles ở đây
      render: (role: string) => {
        const rolesMap: { [key: string]: string } = {
          user: "Người dùng",
          shipper: "Shipper",
          admin: "Quản trị viên",
          sales: "Sales",
          logistic_provider: "Người quản lý kho",
        };
        return rolesMap[role] || role;
      },
    },
    {
      title: "Giới thiệu",
      dataIndex: "description",
      key: "description",
      width: 150,
      align: "left" as const,
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
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Tooltip
            title={record.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
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

  return loading ? (
    <TableSkeleton />
  ) : (
    <>
      <TableHeader
        handleResearch={handleResearch}
        handleSearchChange={handleSearchChange}
        reload={reload}
        searchValue={searchValue}
        setReload={setReload}
        handleAdd={handleAdd}
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
        style={{ margin: "0 10px" }}
        rowKey="username"
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
      />
    </>
  );
};

export default UserTable;
