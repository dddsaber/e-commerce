const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const Coupon = require("../../models/Coupon.model");
const Store = require("../../models/Store.model");
const User = require("../../models/User.model");
const { default: mongoose } = require("mongoose");

// ----------------------------------------------------------------
// Add coupon
// ----------------------------------------------------------------
const createCoupon = async (req, res) => {
  const {
    name,
    userId,
    type,
    value,
    appliedDate,
    expirationDate,
    scope,
    storeApplyCoupon,
  } = req.body;

  console.log(req.body);
  if (!name || !userId || !type || !value || !expirationDate || !appliedDate) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }

  if (isNaN(new Date(appliedDate).getTime())) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid appliedDate format"
    );
  }
  if (isNaN(new Date(expirationDate).getTime())) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid expirationDate format"
    );
  }

  const applied = new Date(appliedDate);
  const expiration = new Date(expirationDate);
  if (applied > expiration) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Applied date cannot be later than expiration date"
    );
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "User is not active"
      );
    }
    const newCoupon = await Coupon.create({
      name: name,
      userId: userId,
      type: type,
      value: value,
      appliedDate: applied,
      expirationDate: expiration,
      isDeleted: false,
      storeApplyCoupon: storeApplyCoupon ?? [],
      scope: scope,
    });

    if (!newCoupon) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create coupon"
      );
    }

    return response(res, StatusCodes.CREATED, true, newCoupon);
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update coupon
// ----------------------------------------------------------------
const updateCoupon = async (req, res) => {
  const { couponId } = req.params;
  const { coupon } = req.body;
  if (!coupon || !couponId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }

  if (
    !coupon.userId ||
    !coupon.type ||
    !coupon.value ||
    !coupon.appliedDate ||
    !coupon.expirationDate
  ) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }

  if (isNaN(new Date(coupon.appliedDate).getTime())) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid appliedDate format"
    );
  }

  if (isNaN(new Date(coupon.expirationDate).getTime())) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid expirationDate format"
    );
  }

  if (coupon.appliedDate > coupon.expirationDate) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Applied date cannot be later than expiration date"
    );
  }

  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, coupon, {
      new: true,
    });
    if (!updatedCoupon) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update coupon"
      );
    }
    return response(res, StatusCodes.OK, true, updatedCoupon);
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get coupons
// ----------------------------------------------------------------
const getCoupons = async (req, res) => {
  const {
    searchKey,
    types,
    value,
    appliedDateBegin,
    appliedDateEnd,
    expirationDateBegin,
    expirationDateEnd,
    storeId,
    isDeleteds,
    scope,
    skip,
    limit,
    sortBy,
  } = req.body;

  try {
    const pipeline = [];
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });

    pipeline.push({
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] },
      },
    });

    pipeline.push({
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    });

    if (searchKey) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchKey, $options: "i" } },
            { type: { $regex: searchKey, $options: "i" } },
            { "user.username": { $regex: searchKey, $options: "i" } },
          ],
        },
      });
    }

    if (types) {
      pipeline.push({
        $match: { type: { $in: types } },
      });
    }
    if (value) {
      pipeline.push({
        $match: { value },
      });
    }

    if (scope) {
      pipeline.push({
        $match: { scope },
      });
    }

    if (appliedDateBegin || appliedDateEnd) {
      pipeline.push({
        $match: {
          appliedDate: {
            $gte: appliedDateBegin ? new Date(appliedDateBegin) : null,
            $lte: appliedDateEnd ? new Date(appliedDateEnd) : null,
          },
        },
      });
    }

    if (expirationDateBegin || expirationDateEnd) {
      pipeline.push({
        $match: {
          expirationDate: {
            $gte: expirationDateBegin ? new Date(expirationDateBegin) : null,
            $lte: expirationDateEnd ? new Date(expirationDateEnd) : null,
          },
        },
      });
    }

    if (storeId) {
      pipeline.push({
        $match: {
          storeApplyCoupon: {
            $elemMatch: {
              storeId: new mongoose.Types.ObjectId(storeId),
              isDeleted: false,
            },
          },
        },
      });
    }

    if (isDeleteds) {
      pipeline.push({
        $match: { isDeleted: { $in: isDeleteds } },
      });
    }

    const countPipeline = [...pipeline];
    countPipeline.push({
      $count: "totalCount",
    });
    const countResult = await Coupon.aggregate(countPipeline);

    const totalCoupons = countResult.length > 0 ? countResult[0].totalCount : 0;

    // 🔹 Sắp xếp kết quả (Sorting)
    pipeline.push({
      $sort: sortBy
        ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
        : { createdAt: -1 },
    });

    // 🔹 Phân trang (skip, limit)
    if (skip) pipeline.push({ $skip: skip });
    if (limit) pipeline.push({ $limit: limit });

    pipeline.push({
      $project: {
        _id: 1,
        userId: 1,
        name: 1,
        type: 1,
        value: 1,
        appliedDate: 1,
        expirationDate: 1,
        isDeleted: 1,
        storeApplyCoupon: 1,
        createdAt: 1,
        updatedAt: 1,
        "user.username": 1,
        "user._id": 1,
        "user.name": 1,
      },
    });

    const coupons = await Coupon.aggregate(pipeline);

    return response(
      res,
      StatusCodes.OK,
      true,
      { coupons, totalCoupons },
      "Coupons retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get coupon by id
// ----------------------------------------------------------------
const getCouponsById = async (req, res) => {
  const { couponId } = req.params;
  if (!couponId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required field: id"
    );
  }
  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Coupon not found"
      );
    }
    if (coupon.isDeleted) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Coupon has been deleted"
      );
    }

    return response(res, StatusCodes.OK, true, coupon, "Coupon found");
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// get valid coupon
// ----------------------------------------------------------------
const getValidCoupons = async (req, res) => {
  const { storeId } = req.params;

  if (!storeId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing storeId");
  }

  try {
    const today = new Date();
    const pipeline = [
      {
        $match: {
          expirationDate: { $gte: today }, // Chỉ lấy coupon còn hạn
          storeApplyCoupon: {
            $elemMatch: {
              storeId: new mongoose.Types.ObjectId(storeId),
              isDeleted: false,
            },
          },
          isDeleted: false,
        },
      },
      {
        $sort: { createdAt: -1 }, // Sắp xếp mới nhất trước
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          value: 1,
          appliedDate: 1,
          expirationDate: 1,
          isDeleted: 1,
          storeApplyCoupon: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const coupons = await Coupon.aggregate(pipeline);

    return response(
      res,
      StatusCodes.OK,
      true,
      { coupons },
      "Valid coupons retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Deleted coupon
// ----------------------------------------------------------------
const updateCouponStatus = async (req, res) => {
  const { couponId } = req.params;
  const { isDeleted } = req.body;
  if (!couponId || typeof isDeleted !== "boolean") {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields: id and isDeleted"
    );
  }

  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { isDeleted },
      { new: true }
    );
    if (!updatedCoupon) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Coupon not found"
      );
    }
    return response(res, StatusCodes.OK, true, updatedCoupon, "Coupon updated");
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Apply coupon to store
// ----------------------------------------------------------------
const applyCouponToStore = async (req, res) => {
  const { couponId, storeId } = req.body;

  if (!couponId || !storeId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields: couponId and storeId"
    );
  }

  try {
    const coupon = await Coupon.findById(couponId);
    if (!coupon || coupon.isDeleted) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Coupon not found or has been deleted"
      );
    }

    if (new Date(coupon.expirationDate) < new Date()) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "Coupon has expired"
      );
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "Store not found");
    }

    const alreadyApplied = coupon.storeApplyCoupon.some(
      (applied) =>
        applied.storeId.toString() === storeId && applied.isDeleted === false
    );

    if (alreadyApplied) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "Coupon has already been applied to this store"
      );
    }
    if (!alreadyApplied) {
      coupon.storeApplyCoupon.push({ storeId, isDeleted: false });
      await coupon.save();
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      coupon,
      "Coupon successfully applied to the store"
    );
  } catch (error) {
    console.error("Error applying coupon:", error);
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      "An error occurred while applying the coupon"
    );
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------
module.exports = {
  createCoupon,
  updateCoupon,
  getCoupons,
  getCouponsById,
  updateCouponStatus,
  applyCouponToStore,
  getValidCoupons,
};
