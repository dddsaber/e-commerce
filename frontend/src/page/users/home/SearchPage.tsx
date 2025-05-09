import {
  Button,
  Checkbox,
  Col,
  Divider,
  Input,
  Rate,
  Row,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { Category } from "../../../type/category.type";
import { getCategories } from "../../../api/category.api";
import { GetProductsRequest, Product } from "../../../type/product.type";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../../../api/product.api";
import ProductCard from "../../../components/products/ProductCard";

const { Title } = Typography;

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = searchParams.get("searchKey") || "";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState<{
    categories: Category[];
    totalCategories: number;
  }>({
    categories: [],
    totalCategories: 0,
  });
  const [limit, setLimit] = useState<number>(10);
  const [filter, setFilter] = useState<GetProductsRequest>({
    isActives: [true],
    categoryIds: [],
    searchKey: searchKey,
  });
  const [productData, setProductData] = useState<{
    products: Product[];
    totalProducts: number;
  }>({
    products: [],
    totalProducts: 0,
  });

  useEffect(() => {
    const categoriesFromParams =
      searchParams.get("categories")?.split(",") || [];
    const searchKeyFromParams = searchParams.get("searchKey") || "";
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const rating = searchParams.get("rating");

    setFilter({
      isActives: [true],
      searchKey: searchKeyFromParams,
      categoryIds: categoriesFromParams,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      rating: rating ? parseInt(rating) : undefined,
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getProducts(filter);
      setProductData(data);
      setLoading(false);
    };
    fetchProducts();
  }, [filter]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const data = await getCategories({ limit: limit });
      setCategoryData(data);
      setLoading(false);
    };
    fetchCategories();
  }, [limit]);

  const handleCategoryChange = (selectedCategories: string[]) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      categoryIds: selectedCategories,
    }));

    const newParams = new URLSearchParams(searchParams);
    if (selectedCategories.length > 0) {
      newParams.set("categories", selectedCategories.join(","));
    } else {
      newParams.delete("categories");
    }
    setSearchParams(newParams);
  };

  const handlePriceFilter = () => {
    const minPrice = parseFloat(
      (document.getElementById("minPrice") as HTMLInputElement).value
    );
    const maxPrice = parseFloat(
      (document.getElementById("maxPrice") as HTMLInputElement).value
    );

    setFilter((prevFilter) => ({
      ...prevFilter,
      priceMin: isNaN(minPrice) ? undefined : minPrice,
      priceMax: isNaN(maxPrice) ? undefined : maxPrice,
    }));

    const newParams = new URLSearchParams(searchParams);
    if (!isNaN(minPrice)) newParams.set("priceMin", String(minPrice));
    else newParams.delete("priceMin");
    if (!isNaN(maxPrice)) newParams.set("priceMax", String(maxPrice));
    else newParams.delete("priceMax");
    setSearchParams(newParams);
  };

  const handleRatingFilter = (rating: number) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      rating: rating,
    }));

    const newParams = new URLSearchParams(searchParams);
    newParams.set("rating", String(rating));
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setFilter({
      isActives: [true],
      categoryIds: [],
      searchKey: searchKey,
    });
    setSearchParams({ searchKey });
    (document.getElementById("minPrice") as HTMLInputElement).value = "";
    (document.getElementById("maxPrice") as HTMLInputElement).value = "";
  };

  const buildCategoryOptions = () => {
    return categoryData.categories.map((category) => ({
      label: category.name,
      value: category._id,
    }));
  };

  return (
    <Row gutter={[12, 12]}>
      <Col span={5}>
        <div>
          <Title level={5}>Theo danh mục</Title>
          <Checkbox.Group
            value={filter.categoryIds}
            onChange={handleCategoryChange}
          >
            <Space direction="vertical">
              {buildCategoryOptions().map((item) => (
                <Checkbox key={item.value} value={item.value}>
                  {item.label}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
          <Button
            type="link"
            onClick={() => setLimit(categoryData.totalCategories)}
            style={{
              display:
                limit === categoryData.totalCategories ? "none" : "block",
            }}
          >
            Thêm
          </Button>
        </div>
        <Divider />
        <div>
          <Title level={5}>Khoảng giá</Title>
          <Input
            id="minPrice"
            placeholder="TỪ"
            style={{ width: "45%" }}
            type="number"
          />
          <span> &mdash; </span>
          <Input
            id="maxPrice"
            placeholder="ĐẾN"
            style={{ width: "45%" }}
            type="number"
          />
          <Button
            type="primary"
            style={{ marginTop: 10, width: "100%" }}
            onClick={handlePriceFilter}
          >
            Áp dụng
          </Button>
        </div>
        <Divider />
        <div>
          <Title level={5}>Đánh Giá</Title>
          {[5, 4, 3, 2, 1].map((value) => (
            <Button
              key={value}
              type="text"
              onClick={() => handleRatingFilter(value)}
            >
              <Rate style={{ fontSize: 15 }} value={value} disabled /> trở lên
            </Button>
          ))}
        </div>
        <Divider />
        <Button
          type="primary"
          style={{ marginTop: 10, width: "100%" }}
          onClick={clearAllFilters}
        >
          Xóa tất cả
        </Button>
      </Col>
      <Col span={1}></Col>
      <Col span={18}>
        <Title level={4}>
          Kết quả tìm kiếm cho "
          <span style={{ color: "red" }}>{searchKey}</span>"
        </Title>
        <Row gutter={[12, 12]} style={{ width: "100%" }}>
          {productData.products?.map((product) => (
            <Col span={6} key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  );
};

export default SearchPage;
