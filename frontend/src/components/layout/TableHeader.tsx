import {
  PlusCircleFilled,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input } from "antd";
import React from "react";

interface TableHeaderProps {
  searchValue: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResearch: () => void;
  reload: boolean;
  setReload: (value: boolean) => void;
  handleAdd?: () => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  searchValue,
  handleSearchChange,
  handleResearch,
  reload,
  setReload,
  handleAdd,
}) => {
  return (
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
        <Flex gap={5} style={{ width: "80%" }}>
          <Input
            placeholder="Tìm kiếm"
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={handleSearchChange}
            style={{ marginBottom: 16, width: "70%" }}
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
        <Flex style={{ width: "10%" }}>
          {handleAdd ? (
            <Button
              type="primary"
              icon={<PlusCircleFilled />}
              onClick={() => handleAdd()}
            >
              Thêm
            </Button>
          ) : (
            <></>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default TableHeader;
