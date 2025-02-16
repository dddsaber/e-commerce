import { useEffect, useState } from "react";
import { Card, List, Typography, Spin, Badge, Row, Col } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getReports } from "../../api/report.api";
import { Report } from "../../type/report.type";
import { useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const { Text } = Typography;

export default function ReportOverview(): JSX.Element {
  const [totalReports, setTotalReports] = useState<number>(0);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getReports({
        isHandles: [false],
      });
      setTotalReports(data.reports.length);
      setPendingReports(data.reports);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Tạo dữ liệu biểu đồ tròn
  const categoryCount: Record<string, number> = pendingReports.reduce(
    (acc, report) => {
      acc[report.reportCategory] = (acc[report.reportCategory] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = {
    labels: Object.keys(categoryCount),
    datasets: [
      {
        data: Object.values(categoryCount),
        backgroundColor: ["#ff4d4f", "#faad14", "#52c41a", "#1890ff"],
      },
    ],
  };

  return (
    <Card
      title={"Reports"}
      styles={{
        header: {
          color: "#0D1E4C",
          fontSize: 25,
          backgroundColor: "#fafafa",
          textAlign: "center",
        },
      }}
      hoverable
    >
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Text strong>Totals: {totalReports}</Text>
          <Row gutter={16} onClick={() => navigate("/admin/manage-reports")}>
            {/* Danh sách báo cáo (chiếm 2/3 chiều rộng) */}
            <Col span={16}>
              <List
                itemLayout="horizontal"
                dataSource={pendingReports}
                renderItem={(report: Report) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <ExclamationCircleOutlined style={{ color: "red" }} />
                      }
                      title={<Text strong>{report.title}</Text>}
                      description={report.content}
                    />
                    <Badge status="error" text={report.reportCategory} />
                  </List.Item>
                )}
              />
            </Col>
            {/* Biểu đồ tròn (chiếm 1/3 chiều rộng) */}
            <Col
              span={8}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ width: "100%", maxWidth: 300 }}>
                <Pie data={pieData} />
              </div>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}
