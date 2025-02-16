import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

interface TitleProps {
  title: React.ReactNode;
  subTitle?: string;
  justify?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  showBack?: boolean;
  right?: React.ReactNode;
  styles?: React.CSSProperties;
  styleContainer?: React.CSSProperties;
}

const Title: React.FC<TitleProps> = ({
  title,
  subTitle,
  justify = "start", // default value for justify
  showBack = false, // default value for showBack
  right,
  styles,
  styleContainer,
}) => {
  const navigate = useNavigate();

  return (
    <Flex
      gap={20}
      align="center"
      justify={justify}
      style={{ margin: "0 0 20 0", padding: "0", ...styleContainer }}
    >
      {showBack && (
        <Tooltip title="Quay lại">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        </Tooltip>
      )}
      <Typography.Title
        level={3}
        style={{ marginTop: 0, marginBottom: 0, ...styles }}
      >
        {title}
      </Typography.Title>
      {subTitle && (
        <Typography.Title
          level={5}
          style={{ marginTop: 0, marginBottom: 0, ...styles }}
        >
          {subTitle}
        </Typography.Title>
      )}
      {right}
    </Flex>
  );
};

export default Title;
