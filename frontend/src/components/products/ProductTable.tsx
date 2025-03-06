import React, { useEffect, useState, useCallback } from "react";
import { GetProductsRequest, Product } from "../../type/product.type";
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
  Image,
} from "antd";
import {
  EditOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { getProducts, updateProductStatus } from "../../api/product.api";
import { debounce } from "lodash";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { handleError } from "../../utils/handle_error_func";
import { getSourceImage } from "../../utils/handle_image_func";
import { formatDate, formatRate } from "../../utils/handle_format_func";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { TYPE_USER } from "../../utils/constant";
import { getStoreByUserId } from "../../api/store.api";

interface ProductTableProps {
  reload: boolean;
  setReload: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setSelectedProduct: (product?: Product) => void;
  showDrawer: () => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  reload,
  setReload,
  loading,
  setLoading,
  setSelectedProduct,
  showDrawer,
}) => {
  const [data, setData] = useState<Product[]>([]);
  const [filter, setFilter] = useState<GetProductsRequest>({
    isActives: [true, false],
    categoryIds: [],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    pageSize: 10,
    current: 1,
    total: 0,
  });
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchStore = async () => {
      if (user.role === TYPE_USER.sales) {
        const store = await getStoreByUserId(user._id);
        filter.storeId = store._id;
      }
    };
    fetchStore();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { products, totalProducts } = await getProducts(filter);
        setData(products);
        setPagination((prevPagination) => ({
          ...prevPagination,
          total: totalProducts,
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
    const newFilter: GetProductsRequest = {
      skip: parseInt(searchParams.get("skip") || "0"),
      limit: parseInt(searchParams.get("limit") || "10"),
      searchKey: searchParams.get("searchKey") || undefined,
      categoryIds: searchParams.get("categoryIds")?.split(","),
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

  const handleStatus = async (record: Product) => {
    try {
      const response = await updateProductStatus(record._id, !record.isActive);
      if (response) {
        if (response.isActive) message.success("Product has been unblocked!");
        else message.success("Product has been blocked!");
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

  const handleEdit = (record: Product) => {
    setSelectedProduct(record);
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
      sorter: SorterResult<Product> | SorterResult<Product>[]
    ) => {
      setPagination(pagination);
      setFilter((prevFilter) => ({
        ...prevFilter,
        categoryIds: filters.categoryId
          ? (filters.categoryId as string[])
          : prevFilter.categoryIds,
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

  const columns: TableColumnsType<Product> = [
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
      dataIndex: "image",
      key: "image",
      width: 60,
      align: "center" as const, // Sử dụng 'as const'
      render: (image: string) => (
        <Image
          style={{ width: 50, height: 50 }}
          src={getSourceImage(image) || "default.jpg"}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: true,
      width: 170,
      align: "center" as const,
    },
    {
      title: "Cửa hàng",
      dataIndex: ["store", "name"],
      key: "store.name",
      sorter: true,
      width: 150,
      align: "center" as const,
    },
    {
      title: "Giá nhập",
      dataIndex: "cost",
      key: "cost",
      sorter: true,
      width: 200,
      ellipsis: true,
      align: "center" as const,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      sorter: true,
      width: 150,
      align: "center" as const,
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      sorter: true,
      width: 150,
      align: "center" as const,
      render: (discount: number) => `${discount * 100}%`,
    },
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      sorter: true,
      width: 120,
      align: "center" as const,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      sorter: true,
      width: 150,
      align: "center" as const,
      render: (rating: number) => formatRate(rating),
    },
    {
      title: "Số đánh giá",
      dataIndex: "numberOfRatings",
      key: "numberOfRatings",
      sorter: true,
      width: 150,
      align: "center" as const,
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category.name",
      sorter: true,
      width: 150,
      align: "center" as const,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      sorter: true,
      width: 150,
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
      title: "Tồn Kho",
      dataIndex: ["inventory", "quantity"],
      key: "inventory.quantity",
      sorter: true,
      width: 150,
      align: "center" as const,
    },
    {
      title: "Đặt trước",
      dataIndex: ["inventory", "reservedQuantity"],
      key: "inventory.reservedQuantity",
      sorter: true,
      width: 150,
      align: "center" as const,
    },
    {
      title: "Đã bán",
      dataIndex: ["inventory", "soldQuantity"],
      key: "inventory.soldQuantity",
      sorter: true,
      width: 150,
      align: "center" as const,
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
      render: (_: unknown, record: Product) => (
        <Space size="middle">
          <Tooltip
            title={record.isActive ? "Khóa sản phẩm" : "Mở khóa sản phẩm"}
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
        style={{ marginBottom: 10, marginTop: 10 }}
      >
        <Flex gap={10}>
          <Input
            placeholder="Tìm kiếm sản phẩm"
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
          Total products: {pagination.total}
        </Typography.Title>
      </Flex>
      <Table
        bordered
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        rowKey="name"
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
      />
    </>
  );
};

export default ProductTable;
