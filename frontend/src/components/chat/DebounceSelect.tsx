import { Flex, Select, Spin } from "antd";
import debounce from "lodash/debounce";
import React, { useMemo, useRef, useState } from "react";

interface OptionType {
  value: string;
  label: string;
}

interface DebounceSelectProps {
  fetchOptions: (search: string) => Promise<OptionType[]>;
  debounceTimeout?: number;
  childrenRight?: React.ReactNode;
  refreshData?: boolean;
  selectId?: string;
  initValue?: OptionType[];
  onChange?: (value: OptionType | undefined) => void;
  allowClear?: boolean;
  onSelected?: (selected: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  value?: OptionType | undefined;
}

const DebounceSelectMemo: React.FC<DebounceSelectProps> = ({
  fetchOptions,
  debounceTimeout = 800,
  childrenRight = null,
  refreshData = false,
  selectId = "",
  initValue = [],
  onChange,
  allowClear = false,
  onSelected,
  ...props
}) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<OptionType[]>(initValue);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (search: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFetching(true);

      fetchOptions(search)
        .then((newOptions) => {
          if (fetchId !== fetchRef.current) return;
          setOptions(newOptions);
          setFetching(false);
        })
        .catch(() => setFetching(false));
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  React.useEffect(() => {
    debounceFetcher("");
  }, [refreshData]);

  return (
    <Flex gap={10}>
      <Select
        allowClear={allowClear}
        onClear={() => {
          setOptions([]);
          onChange?.(undefined);
          debounceFetcher("");
        }}
        id={selectId}
        showSearch
        filterOption={false}
        loading={fetching}
        value={props.value?.value} // Chỉ truyền giá trị string vào Select
        onChange={(selectedValue) => {
          const selectedOption =
            options.find((option) => option.value === selectedValue) ||
            undefined;
          onChange?.(selectedOption);
        }}
        onSearch={debounceFetcher}
        onSelect={(selectedValue) => {
          onSelected?.(selectedValue);
        }}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        {...props}
        options={options.map((option) => ({
          label: option.label,
          value: option.value,
        }))} // Đảm bảo options hợp lệ
      />
      {childrenRight}
    </Flex>
  );
};

export const DebounceSelect = React.memo(DebounceSelectMemo);
