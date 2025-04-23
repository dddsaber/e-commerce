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
          storeId: storeId
            ? new mongoose.Types.ObjectId(storeId)
            : { $ne: null },
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
      {
        $match: {
          "storeInfo.name": { $regex: searchKey ?? "", $options: "i" },
          ...(Array.isArray(isActives) && isActives.length > 0
            ? { "storeInfo.isActive": { $in: isActives } }
            : {}),
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
        $lookup: {
          from: "deliveries",
          localField: "_id",
          foreignField: "orderId",
          as: "deliveryInfo",
        },
      },
      {
        $unwind: {
          path: "$deliveryInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          realTotal: {
            $sum: {
              $map: {
                input: "$orderDetails",
                as: "detail",
                in: {
                  $multiply: [
                    "$$detail.quantity",
                    "$$detail.price",
                    { $subtract: [1, { $ifNull: ["$$detail.discount", 0] }] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$storeId",
          name: { $first: "$storeInfo.name" },
          logo: { $first: "$storeInfo.logo" },
          isActive: { $first: "$storeInfo.isActive" },
          totalProducts: { $sum: "$realTotal" },
          coupon: {
            $sum: {
              $cond: {
                if: { $eq: ["$couponInfo.type", "fixed"] },
                then: "$couponInfo.value",
                else: { $multiply: ["$couponInfo.value", "$realTotal"] },
              },
            },
          },
          shippingFee: { $sum: "$deliveryInfo.shippingFee" },
          totalCommission: { $sum: "$fees.commission" },
          totalTransaction: { $sum: "$fees.transaction" },
          totalService: { $sum: "$fees.service" },
        },
      },
      { $sort: { [sortBy]: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: 1,
          logo: 1,
          totalProducts: 1,
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
        $unwind: "$orderDetails", // Giải nở orderDetails để tính tổng giá trị sản phẩm
      },
      {
        $group: {
          _id: groupFormat,
          revenue: {
            $sum: {
              $multiply: [
                "$orderDetails.quantity",
                {
                  $subtract: [
                    "$orderDetails.price",
                    { $ifNull: ["$orderDetails.discount", 0] },
                  ],
                },
              ],
            },
          },
          totalCommission: { $sum: "$fees.commission" },
          totalTransaction: { $sum: "$fees.transaction" },
          totalService: { $sum: "$fees.service" },
          totalCoupon: { $sum: "$orderDetails.discount" }, // Nếu coupon được áp dụng cho từng sản phẩm
        },
      },
      {
        $project: {
          revenue: 1,
          totalCommission: 1,
          totalTransaction: 1,
          totalService: 1,
          totalCoupon: 1,
          // Tính doanh thu cuối cùng = doanh thu sản phẩm - phí - coupon
          netRevenue: {
            $subtract: [
              { $subtract: ["$revenue", "$totalCommission"] },
              { $add: ["$totalTransaction", "$totalService", "$totalCoupon"] },
            ],
          },
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
      totalCoupon: item.totalCoupon,
      netRevenue: item.netRevenue, // Doanh thu sau khi trừ phí và coupon
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

    // 1. Tính tổng doanh thu sản phẩm (không tính phí và coupon)
    const totalRevenueResult = await Order.aggregate([
      { $match: { storeId: storeObjectId } },
      { $unwind: "$orderDetails" },
      {
        $group: {
          _id: null,
          revenue: {
            $sum: {
              $multiply: [
                "$orderDetails.quantity",
                {
                  $subtract: [
                    "$orderDetails.price",
                    { $ifNull: ["$orderDetails.discount", 0] },
                  ],
                },
              ],
            },
          },
          totalCoupon: { $sum: "$orderDetails.discount" }, // Tổng giá trị coupon
        },
      },
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].revenue : 0;
    const totalCoupon =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].totalCoupon : 0;

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

    // Tính doanh thu sau khi trừ phí và coupon
    const netRevenue = totalRevenue - totalCoupon;

    return response(
      res,
      StatusCodes.OK,
      true,
      {
        totalRevenue,
        totalCoupon,
        netRevenue,
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
