import {
  AppstoreAddOutlined,
  DollarOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import { getCardWrapperInfo } from "../../api/statistic.api";
import { useEffect, useState } from "react";
import { CardWrapperInfo } from "../../type/statistic.type";

export default function CardWrapper(): JSX.Element {
  const [cardWrapperInfo, setCardWrapperInfo] = useState<CardWrapperInfo>();

  useEffect(() => {
    async function fetchData() {
      const data = await getCardWrapperInfo();
      setCardWrapperInfo(data);
      console.log(data);
    }
    fetchData();
  }, []);
  return (
    <div>
      <Row gutter={16}>
        {/* Card Users */}
        <Col span={6}>
          <Card
            title="Users"
            hoverable
            styles={{
              header: {
                backgroundColor: "#6BA3BE",
                color: "#fff",
                textAlign: "center",
              },
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <UserOutlined
                  style={{
                    fontSize: "40px",
                    color: "#6BA3BE",
                    verticalAlign: "bottom",
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Users"
                  value={cardWrapperInfo?.numberOfUsers}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Card Products */}
        <Col span={6}>
          <Card
            title="Products"
            hoverable
            styles={{
              header: {
                backgroundColor: "#6BA3BE",
                textAlign: "center",
                color: "#fff",
              },
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <AppstoreAddOutlined
                  style={{
                    fontSize: "40px",
                    color: "#6BA3BE",
                    verticalAlign: "bottom",
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Products"
                  value={cardWrapperInfo?.numberOfProducts}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Card Stores */}
        <Col span={6}>
          <Card
            title="Stores"
            hoverable
            styles={{
              header: {
                backgroundColor: "#6BA3BE",
                textAlign: "center",
                color: "#fff",
              },
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <ShopOutlined
                  style={{
                    fontSize: "40px",
                    color: "#6BA3BE",
                    verticalAlign: "bottom",
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Stores"
                  value={cardWrapperInfo?.numberOfStores}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Card Revenue */}
        <Col span={6}>
          <Card
            title="Revenue"
            hoverable
            styles={{
              header: {
                backgroundColor: "#6BA3BE",
                textAlign: "center",
                color: "#fff",
              },
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <DollarOutlined
                  style={{
                    fontSize: "40px",
                    color: "#6BA3BE",
                    verticalAlign: "bottom",
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Total Revenue"
                  value={`$${cardWrapperInfo?.totalRevenue}`}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
