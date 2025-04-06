import React, { useState } from "react";
import ReportTable from "../../../components/reports/ReportTable";
import { Report } from "../../../type/report.type";
import ReportDrawer from "../../../components/reports/ReportDrawer";

const ReportsManagePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | undefined>(
    undefined
  );
  const onClose = () => {
    setSelectedReport(undefined);
    setIsVisible(false);
  };

  const showDrawer = () => {
    setIsVisible(true);
  };

  return (
    <div>
      <ReportTable
        setSelectedReport={setSelectedReport}
        showDrawer={showDrawer}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
        setReload={setReload}
      />
      <ReportDrawer
        visible={isVisible}
        onClose={onClose}
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        reload={reload}
        setReload={setReload}
      />
    </div>
  );
};

export default ReportsManagePage;
