import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { getProducts } from "../../api/product.api";
import { getSourceImage } from "../../utils/handle_image_func";

interface ProductOption {
  label: JSX.Element;
  value: string; // _id
  link: string;
}

const ModifySearch = () => {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const navigate = useNavigate();

  const fetchOptions = async (value: string) => {
    if (!value.trim()) {
      setOptions([]);
      return;
    }

    try {
      const { products } = await getProducts({ searchKey: value });

      const productOptions: ProductOption[] = products.map((item) => ({
        value: item._id,
        link: `/product/${item._id}`,
        label: (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <img
              src={getSourceImage(item.image || "")}
              alt={item.name}
              style={{
                width: 45,
                height: 45,
                borderRadius: 5,
                objectFit: "cover",
              }}
            />
            <span>{item.name}</span>
          </div>
        ),
      }));

      setOptions(productOptions);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const debouncedSearch = useCallback(debounce(fetchOptions, 500), []);

  const handleSearch = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSelect = (value: string) => {
    const selectedItem = options.find((option) => option.value === value);
    if (selectedItem?.link) {
      navigate(selectedItem.link);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      navigateToSearchPage();
    }
  };

  const handleSearchClick = () => {
    navigateToSearchPage();
  };

  const navigateToSearchPage = () => {
    if (inputValue.trim()) {
      navigate(`/search?searchKey=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <AutoComplete
      style={{ width: "40%", borderRadius: "30px" }}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      placeholder="Tìm kiếm sản phẩm"
      dropdownStyle={{
        maxHeight: 300,
        overflowY: "auto",
      }}
    >
      <Input
        suffix={<SearchOutlined onClick={handleSearchClick} />}
        onPressEnter={handleSearchClick}
        onKeyDown={handleKeyDown}
      />
    </AutoComplete>
  );
};

export default ModifySearch;
