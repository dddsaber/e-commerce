const { StatusCodes } = require("http-status-codes");
const Order = require("../../models/Order.model");
const Product = require("../../models/Product.model");
const Store = require("../../models/Store.model");
const User = require("../../models/User.model");
const { handleError } = require("../../utils/error.utils");
const response = require("../../utils/response.utils");
const mongoose = require("mongoose");

const getCardWrapperData = async (req, res) => {
  try {
    const numberOfUsers = await User.countDocuments();
    const numberOfProducts = await Product.countDocuments();
    const numberOfStores = await Store.countDocuments();
    const revenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "delivered"] }, // Lọc các đơn hàng có status là 'completed' hoặc 'delivered'
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" }, // Tính tổng trường "total" (hoặc "amount") trong các đơn hàng đã lọc
        },
      },
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;
    console.log(
      "Number of users:",
      numberOfUsers,
      "Number of products:",
      numberOfProducts,
      "Number of stores:",
      numberOfStores,
      "Total revenue:",
      totalRevenue
    );
    if (
      numberOfUsers === undefined ||
      numberOfProducts === undefined ||
      numberOfStores === undefined ||
      totalRevenue === undefined
    ) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Error retrieving card wrapper data"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      {
        numberOfUsers,
        numberOfProducts,
        numberOfStores,
        totalRevenue,
      },
      "Card wrapper data retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};
const getTotalAndFeesByStore = async (req, res) => {
  const {
    isActives,
    searchKey,
    storeId,
    skip = 0,
    limit = 10,
    sortBy = "total",
    settleds,
  } = req.body;

  try {
    const results = await Order.aggregate([
      {
        $match: {
          storeId: storeId ? storeId : { $ne: null },
          ...(settleds ? { settled: { $in: settleds } } : {}),
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "_id",
          as: "storeInfo",
        },
      },
      { $unwind: "$storeInfo" },

      // Lọc theo searchKey và trạng thái cửa hàng (isActive)
      {
        $match: {
          "storeInfo.name": { $regex: searchKey ?? "", $options: "i" },
          ...(Array.isArray(isActives) && isActives.length > 0
            ? { "storeInfo.isActive": { $in: isActives } }
            : {}), // Lọc theo danh sách trạng thái
        },
      },

      {
        $lookup: {
          from: "coupons",
          localField: "couponId",
          foreignField: "_id",
          as: "couponInfo",
        },
      },
      {
        $unwind: {
          path: "$couponInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$storeId",
          name: { $first: "$storeInfo.name" },
          logo: { $first: "$storeInfo.logo" },
          isActive: { $first: "$storeInfo.isActive" },
          total: { $sum: "$total" },
          coupon: {
            $sum: {
              $cond: {
                if: { $eq: ["$couponInfo.type", "flat"] },
                then: "$couponInfo.value",
                else: { $multiply: ["$couponInfo.value", "$total"] },
              },
            },
          },
          shippingFee: { $sum: "$shippingFee" },
          totalCommission: { $sum: "$fees.commission" },
          totalTransaction: { $sum: "$fees.transaction" },
          totalService: { $sum: "$fees.service" },
        },
      },

      {
        $sort: { [sortBy]: -1 },
      },

      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },

      {
        $project: {
          name: 1,
          logo: 1,
          total: 1,
          coupon: 1,
          shippingFee: 1,
          totalCommission: 1,
          totalTransaction: 1,
          totalService: 1,
          isActive: 1,
        },
      },
    ]);

    return response(
      res,
      StatusCodes.OK,
      true,
      results,
      "Total and fees by store retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

const getRevenueChartData = async (req, res) => {
  try {
    const { type, storeId } = req.body;

    let groupFormat;
    if (type === "monthly") {
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
    } else if (type === "quarterly") {
      groupFormat = {
        year: { $year: "$createdAt" },
        quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
      };
    } else {
      groupFormat = { year: { $year: "$createdAt" } };
    }

    // Tạo bộ lọc match
    let matchCondition = {};
    if (storeId) {
      matchCondition.storeId = new mongoose.Types.ObjectId(storeId);
    }

    const revenueData = await Order.aggregate([
      { $match: matchCondition }, // Lọc theo storeId
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$total" },
          totalCommission: { $sum: "$fees.commission" },
          totalTransaction: { $sum: "$fees.transaction" },
          totalService: { $sum: "$fees.service" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.quarter": 1 } },
    ]);

    const formattedData = revenueData.map((item) => ({
      time:
        item._id.year +
        (item._id.month
          ? `-${item._id.month}`
          : item._id.quarter
            ? ` Q${item._id.quarter}`
            : ""),
      revenue: item.revenue,
      totalCommission: item.totalCommission,
      totalTransaction: item.totalTransaction,
      totalService: item.totalService,
    }));

    return response(
      res,
      StatusCodes.OK,
      true,
      formattedData,
      "Revenue chart data retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return handleError(res, error.message);
  }
};

const getStoreRevenueStats = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        null,
        "storeId is required"
      );
    }

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    // 1. Tính tổng doanh thu
    const totalRevenueResult = await Order.aggregate([
      { $match: { storeId: storeObjectId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
        },
      },
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

    // 2. Đếm số tháng có doanh thu
    const distinctMonths = await Order.aggregate([
      { $match: { storeId: storeObjectId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
        },
      },
      { $count: "totalMonths" },
    ]);

    const totalMonths =
      distinctMonths.length > 0 ? distinctMonths[0].totalMonths : 1; // Tránh chia cho 0

    // 3. Tính doanh thu trung bình theo tháng
    const averageMonthlyRevenue = totalRevenue / totalMonths;

    return response(
      res,
      StatusCodes.OK,
      true,
      {
        totalRevenue,
        averageMonthlyRevenue,
      },
      "Store revenue statistics retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching store revenue statistics:", error);
    return handleError(res, error.message);
  }
};

module.exports = {
  getCardWrapperData,
  getTotalAndFeesByStore,
  getRevenueChartData,
  getStoreRevenueStats,
};
