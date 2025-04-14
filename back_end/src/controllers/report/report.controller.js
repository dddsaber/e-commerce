const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { reportCategories } = require("../../utils/constants.utils");
const { handleError } = require("../../utils/error.utils");
const User = require("../../models/User.model");
const Report = require("../../models/Report.model");
const Product = require("../../models/Product.model");
const Review = require("../../models/Review.model");
const Store = require("../../models/Store.model");

// ----------------------------------------------------------------
// Create Report
// ----------------------------------------------------------------
const isValidCategory = (category) => {
  return Object.values(reportCategories).includes(category);
};

// ----------------------------------------------------------------
// Create Report
// ----------------------------------------------------------------
const createReport = async (req, res) => {
  const { userId, title, content, reportCategory, reportedId, linkTo } =
    req.body;
  console.log(req.body);
  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing userId");
  }
  if (!title || !content || !reportCategory || !reportedId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }
    if (!isValidCategory(reportCategory)) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Invalid report category"
      );
    }
    const newReport = Report.create({
      userId: userId,
      title: title,
      content: content,
      reportCategory: reportCategory,
      reportedId: reportedId,
      linkTo: linkTo,
      isHandle: false,
      isDelete: false,
    });
    if (!newReport) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create report"
      );
    }
    return response(
      res,
      StatusCodes.CREATED,
      true,
      newReport,
      "Report created successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Handle Report
// ----------------------------------------------------------------
const handleReport = async (req, res) => {
  const { reportId, adminId } = req.params;
  if (!reportId || !adminId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }

  try {
    const report = await Report.findById(reportId);
    if (!report) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Report not found"
      );
    }
    report.adminId = adminId;
    report.isHandle = true;
    await report.save();
    return response(
      res,
      StatusCodes.OK,
      true,
      report,
      "Report has been handled successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update Report's status
// ----------------------------------------------------------------
const updateReportStatus = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  console.log(status);
  if (!reportId || typeof status !== "boolean") {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }

  try {
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        isDeleted: status,
      },
      { new: true }
    );

    if (!report) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Report not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      report,
      "Report's status has been updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get Reports
// ----------------------------------------------------------------
const getReports = async (req, res) => {
  const {
    userId,
    adminId,
    searchKey,
    reportCategories,
    reportedId,
    isHandles,
    isDeleteds,
    skip,
    limit,
    sortBy,
  } = req.body;

  try {
    let filters = {};

    if (userId) {
      filters.userId = userId;
    }
    if (adminId) {
      filters.adminId = adminId;
    }
    if (reportedId) {
      filters.reportedId = reportedId;
    }

    if (searchKey) {
      filters.$or = [
        { title: { $regex: searchKey, $options: "i" } },
        { content: { $regex: searchKey, $options: "i" } },
        { reportedCategory: { $regex: searchKey, $options: "i" } },
      ];
    }
    if (reportCategories) {
      filters.reportCategory = { $in: reportCategories };
    }

    if (isHandles && Array.isArray(isHandles)) {
      filters.isHandle = { $in: isHandles }; // filter based on array
    }

    if (isDeleteds && Array.isArray(isDeleteds)) {
      filters.isDeleted = { $in: isDeleteds }; // filter based on array
    }
    const countResults = await Report.countDocuments(filters);

    const reports = await Report.find(filters)
      .skip(Number(skip)) // Skip the records based on the "skip" value
      .limit(Number(limit)) // Limit the number of reports returned
      .sort(
        sortBy
          ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
          : { createdAt: -1 }
      ); // Sort based on the "sortBy" field

    return response(
      res,
      StatusCodes.OK,
      true,
      { reports, totalReports: countResults },
      "Reports found successfully"
    );
  } catch (error) {
    console.error(error);
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Create Report By Id
// ----------------------------------------------------------------
const getReportById = async (req, res) => {
  const { reportId } = req.params;
  if (!reportId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const report = await Report.findById(reportId);

    if (!report) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Report not found"
      );
    }

    let reportedObject;
    switch (report.reportCategory) {
      case "User":
        reportedObject = await User.findById(report.reportedId);
        break;
      case "Product":
        reportedObject = await Product.findById(report.reportedId);
        break;
      case "Review":
        reportedObject = await Review.findById(report.reportedId);
        break;
      case "Store":
        reportedObject = await Store.findById(report.reportedId);
        break;
      default:
        break;
    }
    if (!reportedObject) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to find related object"
      );
    }
    report.reportedObject = reportedObject;

    return response(
      res,
      StatusCodes.OK,
      true,
      report,
      "Report found successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------

module.exports = {
  createReport,
  handleReport,
  updateReportStatus,
  getReports,
  getReportById,
};
