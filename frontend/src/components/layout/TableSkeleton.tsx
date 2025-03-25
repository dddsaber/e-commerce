import { Col, Row, Skeleton } from "antd";
import React from "react";
import "./TableSkeleton.css";
const TableSkeleton: React.FC = () => {
  return (
    <>
      <Row gutter={[12, 12]} style={{ margin: "10px 0" }}>
        <Col span={13} style={{ marginRight: 30 }}>
          <Skeleton.Input active={true} className="custom-skeleton-table" />
        </Col>
        <Col
          span={1}
          style={{ marginRight: 20 }}
          className="custom-skeleton-table"
        >
          <Skeleton.Button active={true} />
        </Col>
        <Col span={1}>
          <Skeleton.Button active={true} className="custom-skeleton-table" />
        </Col>
        <Col span={6}></Col>
        <Col
          flex={"auto"}
          span={2}
          style={{
            textAlign: "right",
          }}
        >
          <Skeleton.Button active={true} className="custom-skeleton-table" />
        </Col>
        <Col
          span={24}
          style={{
            textAlign: "right",
          }}
        >
          <Skeleton.Input active={true} style={{ width: 150 }} />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>
        <Col span={3}>
          <Skeleton.Node
            active={true}
            className="custom-skeleton-table custom-skeleton-table-header"
          />
        </Col>

        {Array.from({ length: 9 }).map((_, index) => (
          <Col span={24} key={index} className="custom-skeleton-table">
            <Skeleton.Input
              active
              size="large"
              className="custom-skeleton-table"
            />
          </Col>
        ))}
        <Col span={22} style={{ marginTop: 10 }}></Col>
        <Col span={1} style={{ marginTop: 10 }}>
          <Skeleton.Button
            active
            size="default"
            className="custom-skeleton-table"
          />
        </Col>
      </Row>
    </>
  );
};

export default TableSkeleton;
