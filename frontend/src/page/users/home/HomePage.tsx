import React from "react";
import { Breadcrumb } from "antd";

const HomePage: React.FC = () => {
  return (
    <div>
      <Breadcrumb
        items={[
          {
            href: "/",
            title: "Trang chủ",
          },
        ]}
      />
    </div>
  );
};

export default HomePage;
