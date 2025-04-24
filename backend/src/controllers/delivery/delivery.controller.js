const response = require("../../utils/response.utils");
const Delivery = require("../../models/Delivery.model");
const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");
const {
  findNearestWarehouse,
  calculateShippingDetails,
  calculateDistance,
} = require("../warehouse/delivery_calculate.controller");
const mongoose = require("mongoose");
const { DELIVERY_STATUS } = require("../../utils/constants.utils");

// ----------------------------------------------------------------
// Create a new delivery
// ----------------------------------------------------------------
const createDelivery = async (
  orderId,
  user_address,
  store,
  recipientName,
  phoneNumber,
  codAmount,
  paymentStatus
) => {
  try {
    const user_location = `${user_address.ward}, ${user_address.district}, ${user_address.province}`;
    const store_location = `${store.address.ward}, ${store.address.district}, ${store.address.province}`;

    const distance = await calculateDistance(user_location, store_location);
    const { shippingFee, estimatedDate } = calculateShippingDetails(distance);

    const deliveryLogs = [];
    deliveryLogs.push({
      location: store.warehouseId,
    });

    const warehouseNearUser = await findNearestWarehouse(user_location);
    if (warehouseNearUser._id.toString() !== store.warehouseId.toString())
      deliveryLogs.push({
        location: warehouseNearUser._id,
      });
    const delivery = await Delivery.create({
      orderId: orderId,

      // courier
      // trackingNumber

      estimatedDate: estimatedDate,
      // deliveredDate

      recipientName: recipientName,
      phoneNumber: phoneNumber,
      address: user_address,
      // postalCode

      shippingFee: shippingFee,
      codAmount: codAmount,
      paymentStatus: paymentStatus,

      deliveryLogs: deliveryLogs,
      status: DELIVERY_STATUS.AWAITING_PICKUP,
    });

    consolt.log("ok");
    console.log(delivery);
    if (delivery) {
      console.log("successMessage");
    }
    if (!delivery) {
      console.log(`failureMessage`);
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

// ----------------------------------------------------------------
// Get delivery info
// ----------------------------------------------------------------
const getDeliveryInfo = async (req, res) => {
  const { user_address, store_address } = req.body;

  try {
    const user_location = `${user_address.ward}, ${user_address.district}, ${user_address.province}`;
    const store_location = `${store_address.ward}, ${store_address.district}, ${store_address.province}`;

    const distance = await calculateDistance(user_location, store_location);
    const { shippingFee, estimatedDate } = calculateShippingDetails(distance);

    return response(
      res,
      StatusCodes.OK,
      true,
      {
        distance,
        shippingFee,
        estimatedDate,
      },
      "Delivery info successfully fetched"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Create a new delivery
// ----------------------------------------------------------------
const updateTimeStamp = async (req, res) => {
  const { deliveryId, warehouseId } = req.params;

  try {
    const delivery = await Delivery.findOne({ _id: deliveryId });
    if (!delivery) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Delivery not found"
      );
    }

    // Chuyển warehouseId thành ObjectId
    const warehouseObjectId = new mongoose.Types.ObjectId(warehouseId);

    // Tìm log có location = warehouseObjectId
    const logEntry = delivery.deliveryLogs.find(
      (log) => log.location.equals(warehouseObjectId) // So sánh ObjectId đúng cách
    );

    if (!logEntry) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Log entry not found"
      );
    }

    // Cập nhật timestamp
    logEntry.timestamp = Date.now();

    // Lưu lại document
    await delivery.save();

    return response(
      res,
      StatusCodes.OK,
      true,
      delivery,
      "Timestamp updated successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get deliveries for warehouse
// ----------------------------------------------------------------
const getDeliveries = async (req, res) => {
  const {
    skip,
    limit,
    searchKey,
    sortBy,
    warehouseId,
    includeAll,
    statuses,
    status,
  } = req.body;

  try {
    const matchCondition = {};

    if (warehouseId) {
      matchCondition["deliveryLogs.location"] = new mongoose.Types.ObjectId(
        warehouseId
      );
    }

    if (!includeAll) {
      // Chỉ lấy những cái chưa có timestamp
      matchCondition["deliveryLogs.timestamp"] = { $exists: false };
    }

    if (statuses && statuses.length > 0) {
      matchCondition["status"] = { $in: statuses };
    }

    if (status) {
      matchCondition["status"] = status;
    }

    if (searchKey) {
      matchCondition["$or"] = [
        { trackingNumber: { $regex: searchKey, $options: "i" } },
        { "address.ward": { $regex: searchKey, $options: "i" } },
        { "address.district": { $regex: searchKey, $options: "i" } },
        { "address.details": { $regex: searchKey, $options: "i" } },
        { "address.province": { $regex: searchKey, $options: "i" } },
        { recipientName: { $regex: searchKey, $options: "i" } },
      ];
    }

    // Tính tổng số lượng đơn giao
    const totalDeliveries = await Delivery.countDocuments(matchCondition);

    let query = Delivery.aggregate([
      { $match: matchCondition },

      // Lookup để lấy thông tin warehouse từ deliveryLogs.location
      {
        $lookup: {
          from: "warehouses", // Collection của warehouse
          localField: "deliveryLogs.location",
          foreignField: "_id",
          as: "warehouses",
        },
      },
      // Thêm thông tin warehouse vào từng log
      {
        $addFields: {
          deliveryLogs: {
            $map: {
              input: "$deliveryLogs",
              as: "log",
              in: {
                location: "$$log.location",
                timestamp: "$$log.timestamp",
                warehouseInfo: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$warehouses",
                        as: "warehouse",
                        cond: { $eq: ["$$warehouse._id", "$$log.location"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },

      // Sắp xếp kết quả
      {
        $sort: sortBy?.field
          ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
          : { createdAt: -1 },
      },

      // Phân trang
      { $skip: skip || 0 },
      { $limit: limit || 10 },

      // Loại bỏ trường warehouses (không cần trả về nguyên cả danh sách warehouse)
      { $unset: "warehouses" },
    ]);

    const deliveries = await query.exec();

    return response(
      res,
      StatusCodes.OK,
      true,
      { deliveries, totalDeliveries },
      "Deliveries fetched successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Update a delivery
// ----------------------------------------------------------------
const updateDelivery = async (req, res) => {};

module.exports = {
  createDelivery,
  updateDelivery,
  getDeliveryInfo,
  updateTimeStamp,
  getDeliveries,
};
