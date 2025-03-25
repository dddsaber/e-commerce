import React, { useEffect, useState, useCallback } from "react";
import { GetReviewsRequest, Review } from "../../type/review.type";
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
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { getReviews, updateReviewStatus } from "../../api/review.api";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleError } from "../../utils/handle_error_func";
import { formatDate } from "../../utils/handle_format_func";
import TableSkeleton from "../layout/TableSkeleton";

interface ReviewTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedReview: (review?: Review) => void;
  showDrawer: () => void;
}

const ReviewTable: React.FC<ReviewTableProps> = ({
  reload,
  setReload,
  loading,
  setLoading,
  setSelectedReview,
  showDrawer,
}) => {
  const [data, setData] = useState<Review[]>([]);
  const [filter, setFilter] = useState<GetReviewsRequest>({
    isDeleteds: [true, false],
    ratings: [1, 2, 3, 4, 5],
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
        const { reviews, totalReviews } = await getReviews(filter);
        setData(reviews);
        console.log(totalReviews);
        setPagination((prevPagination) => ({
          ...prevPagination, // Sao chép các giá trị cũ của pagination
          total: totalReviews, // Cập nhật total mới
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
    const newFilter: GetReviewsRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      ratings: searchParams.get("ratings")?.split(",").map(Number) ?? [
        1, 2, 3, 4, 5,
      ],
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

  const handleStatus = async (record: Review) => {
    try {
      const response = await updateReviewStatus(record._id, !record.isDeleted);
      if (response) {
        if (!response.isDeleted) message.success("Review has been unblocked!");
        else message.success("Review has been blocked!");
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

  const handleEdit = (record: Review) => {
    setSelectedReview(record);
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
      sorter: SorterResult<Review> | SorterResult<Review>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        isDeleteds: filters.isDeleted
          ? (filters.isDeleted as boolean[]).map((val) => val === true)
          : prevFilter.isDeleteds,
        ratings: filters.rating
          ? (filters.rating as (number | string)[]).map(Number) // Chuyển tất cả về số
          : prevFilter.ratings,
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

  const columns: TableColumnsType<Review> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
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
      title: "Tên người dùng",
      dataIndex: ["user", "username"],
      key: "user.username",
      sorter: true,
      width: 200,
      ellipsis: true,
      align: "left" as const,
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "productId",
      key: "productId",
      sorter: true,
      width: 150,
      align: "left" as const,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: ["product", "name"],
      key: "product.name",
      sorter: true,
      width: 200,
      ellipsis: true,
      align: "left" as const,
    },

    {
      title: "Danh mục",
      dataIndex: "rating",
      key: "rating",
      sorter: true,
      width: 150,
      align: "center" as const,
      filters: [
        { text: "1 sao", value: 1 },
        { text: "2 sao", value: 2 },
        { text: "3 sao", value: 3 },
        { text: "4 sao", value: 4 },
        { text: "5 sao", value: 5 },
      ],
      filteredValue: filter.ratings,
      render: (Rating: number) => {
        const RatingMap: { [key: number]: string } = {
          1: "1 sao",
          2: "2 sao",
          3: "3 sao",
          4: "4 sao",
          5: "5 sao",
        };
        return RatingMap[Rating] || Rating;
      },
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
      render: (_: unknown, record: Review) => (
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
            <Typography.Title level={5}>
              Total Revews: {pagination.total}
            </Typography.Title>
          </Flex>
          <Table
            bordered
            columns={columns}
            dataSource={data}
            pagination={pagination}
            rowKey="_id"
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        </>
      )}
    </>
  );
};

export default ReviewTable;
