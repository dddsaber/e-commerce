const { Router } = require("express");
const {
  createReport,
  handleReport,
  updateReportStatus,
  getReports,
  getReportById,
} = require("../controllers/report/report.controller");

const router = Router();

router.post("/create-report", createReport);

router.put("/:reportId/:adminId/handle", handleReport);

router.put("/:reportId/update-report-status", updateReportStatus);

router.post("/get-reports", getReports);

router.get("/:reportId", getReportById);

module.exports = router;
