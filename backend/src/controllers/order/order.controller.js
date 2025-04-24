const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");
const response = require("../../utils/response.utils");
const Inventory = require("../../models/Inventory.model");
const Product = require("../../models/Product.model");
const Coupon = require("../../models/Coupon.model");
const Order = require("../../models/Order.model");
const User = require("../../models/User.model");
const Store = require("../../models/Store.model");
const Payment = require("../../models/Payment.model");
const {
  ORDER_STATUS,
  DELIVERY_STATUS,
} = require("../../utils/constants.utils");
const {
  updateReservedQuantity,
  updateSoldQuantity,
} = require("../inventory/inventory.controller");
const { default: mongoose } = require("mongoose");
const { createDelivery } = require("../delivery/delivery.controller");
const Delivery = require("../../models/Delivery.model");
const {
  getOrderProjection,
  getDeliveryLookupStages,
  getStoreLookupStages,
  getProductLookupStages,
  getUserLookupStages,
  getPaymentLookupStages,
} = require("./order.pipeline");

// ----------------------------------------------------------------
// Create Order
// ----------------------------------------------------------------
// ✅ 1. Kiểm tra dữ liệu đầu vào
const validateOrderInput = (body) => {
  const { paymentId, userId, storeId, orderDetails, address } = body;
  if (
    !paymentId ||
    !userId ||
    !storeId ||
    !Array.isArray(orderDetails) ||
    orderDetails.length === 0 ||
    !address
  ) {
    return "Invalid or missing required fields";
  }
  return null;
};

// ✅ 2. Lấy thông tin cần thiết từ DB
const fetchOrderDependencies = async (
  userId,
  storeId,
  paymentId,
  couponId,
  orderDetails
) => {
  const [user, store, payment, coupon, products, inventories] =
    await Promise.all([
      User.findById(userId),
      Store.findById(storeId),
      Payment.findById(paymentId),
      couponId ? Coupon.findById(couponId) : null,
      Product.find({
        _id: { $in: orderDetails.map((item) => item.productId) },
      }).populate("categoryId"),
      Inventory.find({
        productId: { $in: orderDetails.map((item) => item.productId) },
      }),
    ]);

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  const inventoryMap = new Map(
    inventories.map((inv) => [inv.productId.toString(), inv])
  );

  return { user, store, payment, coupon, productMap, inventoryMap };
};

// ✅ 3. Tính toán tổng đơn hàng
const calculateOrderTotal = (
  orderDetails,
  productMap,
  inventoryMap,
  coupon,
  shippingFee
) => {
  let total = 0;
  let fees = { commission: 0, transaction: 0 };
  let couponValue = 0;

  for (const item of orderDetails) {
    const product = productMap.get(item.productId.toString());
    const inventory = inventoryMap.get(item.productId.toString());
    if (
      !product ||
      !product.isActive ||
      !inventory ||
      inventory.quantity < item.quantity
    ) {
      throw new Error("Product not found, inactive, or out of stock");
    }

    total += item.price * item.quantity * (1 - (item.discount ?? 0));
    fees.commission +=
      product.categoryId.commissionFee * item.price * item.quantity;
  }

  if (coupon) {
    if (coupon.type === "percentage") {
      couponValue = total * coupon.value;
    } else if (coupon.type === "fixed") {
      couponValue = coupon.value;
    }
  }

  total = couponValue <= total ? total - couponValue : 0;

  total += shippingFee ?? 0;
  fees.transaction += total * 0.03;

  return { total, fees, couponValue };
};

// ✅ 4. Cập nhật kho hàng
const deductInventory = async (orderDetails) => {
  await Promise.all(
    orderDetails.map((item) =>
      updateReservedQuantity(item.productId, parseInt(item.quantity), true)
    )
  );
};

// ✅ 5. Tạo đơn giao hàng
const createDeliveryForOrder = async (order, user, store, total, payment) => {
  const paymentStatus =
    payment.name === "Cash on Delivery (COD)" ? "unpaid" : "paid";
  codAmount = paymentStatus === "paid" ? 0 : total;

  await createDelivery(
    order._id,
    user.address,
    store,
    user.name,
    user.phone,
    codAmount,
    paymentStatus
  );
};

const createOrder = async (req, res) => {
  try {
    // 1️⃣ Kiểm tra đầu vào
    const {
      paymentId,
      userId,
      storeId,
      couponId,
      orderDetails,
      address,
      shippingFee,
      ...objOrder
    } = req.body;
    const validationError = validateOrderInput(req.body);
    if (validationError)
      return response(res, StatusCodes.BAD_REQUEST, false, {}, validationError);

    // 2️⃣ Lấy dữ liệu cần thiết từ DB
    const { user, store, payment, coupon, productMap, inventoryMap } =
      await fetchOrderDependencies(
        userId,
        storeId,
        paymentId,
        couponId,
        orderDetails
      );
    if (!user || !store || !payment)
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "User, Store, Payment không tồn tại"
      );

    // 3️⃣ Tính toán tổng tiền đơn hàng
    const { total, fees, couponValue } = calculateOrderTotal(
      orderDetails,
      productMap,
      inventoryMap,
      coupon,
      shippingFee
    );

    // 4️⃣ Tạo đơn hàng
    const newOrder = await Order.create({
      userId,
      storeId,
      paymentId,
      couponId,
      total,
      orderDetails,
      status: ORDER_STATUS.pending,
      fees,
      ...objOrder,
    });
    if (!newOrder)
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create order"
      );

    // 5️⃣ Cập nhật kho hàng
    await deductInventory(orderDetails);

    // 6️⃣ Tạo đơn giao hàng
    await createDeliveryForOrder(newOrder, user, store, total, payment);

    return response(
      res,
      StatusCodes.CREATED,
      true,
      newOrder,
      "Order created successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update Order status
// ----------------------------------------------------------------
const validTransitions = {
  pending: ["confirmed"],
  confirmed: ["shipped"],
  shipped: ["delivered"],
  delivered: ["completed"],
  completed: [],
};

/**
 * Kiểm tra trạng thái đơn hàng có hợp lệ không
 */
const isValidStatusTransition = (previousStatus, newStatus) => {
  return validTransitions[previousStatus]?.includes(newStatus);
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!orderId || !status) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid or missing required fields"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Invalid orderId");
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "Order not found");
    }
    if (isValidStatusTransition(order.status, status) === false) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Invalid status transition"
      );
    }

    if (
      [ORDER_STATUS.cancelled, ORDER_STATUS.completed].includes(order.status)
    ) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        `Order has been ${order.status}`
      );
    }

    // Cập nhật trạng thái giao hàng nếu đơn hàng bị hủy hoặc đã giao
    const deliveryUpdate = {};
    if (status === ORDER_STATUS.shipped) {
      deliveryUpdate.status = DELIVERY_STATUS.IN_TRANSIT;
    } else if (status === ORDER_STATUS.delivered) {
      deliveryUpdate.status = DELIVERY_STATUS.DELIVERED;
      deliveryUpdate.deliveredDate = new Date();
    }

    // Cập nhật trạng thái đơn hàng
    const updateOrder = await Order.findById({ _id: orderId });
    updateOrder.status = status;
    await updateOrder.save();
    if (Object.keys(deliveryUpdate).length > 0) {
      await Delivery.updateOne({ orderId }, deliveryUpdate);
    }

    // Nếu đơn hàng đã giao, cập nhật số lượng hàng bán
    if (
      status === ORDER_STATUS.delivered &&
      Array.isArray(updateOrder.orderDetails)
    ) {
      await Promise.all(
        updateOrder.orderDetails.map((item) =>
          updateSoldQuantity(item.productId, parseInt(item.quantity, 10), true)
        )
      );
    }

    // 👉 Gán lại order sau khi update, nhưng dùng aggregate để lấy thêm product info
    const [updatedOrder] = await Order.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(orderId) },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderDetails.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $addFields: {
          orderDetails: {
            $map: {
              input: "$orderDetails",
              as: "detail",
              in: {
                $mergeObjects: [
                  "$$detail",
                  {
                    product: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$productInfo",
                            as: "prod",
                            cond: { $eq: ["$$prod._id", "$$detail.productId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $unset: "productInfo" },
    ]);

    return response(
      res,
      StatusCodes.OK,
      true,
      updatedOrder,
      "Order status updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Cancel the order
// ----------------------------------------------------------------
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cancelNote } = req.body;

  if (!orderId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid or missing required fields"
    );
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Order not found"
      );
    }

    if (order.status === ORDER_STATUS.cancelled) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Order has been cancelled"
      );
    }
    if (order.status === ORDER_STATUS.completed) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Order has been completed"
      );
    }

    order.status = ORDER_STATUS.cancelled;
    order.cancelNote = cancelNote;
    await order.save();

    await Promise.all(
      order.orderDetails.map((item) =>
        updateReservedQuantity(item.productId, parseInt(item.quantity), false)
      )
    );

    order.status = ORDER_STATUS.cancelled;
    order.cancelNote = cancelNote;
    await order.save();

    return response(
      res,
      StatusCodes.OK,
      true,
      order,
      "Order cancelled successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get Orders
// ----------------------------------------------------------------
const getOrders = async (req, res) => {
  const {
    skip,
    limit,
    sortBy,
    userId,
    storeId,
    processorStaffId,
    paymentId,
    searchKey,
    statuses,
    status,
    total_low,
    total_high,
    settled,
  } = req.body;

  try {
    const pipeline = [];

    if (statuses && statuses.length > 0) {
      pipeline.push({ $match: { status: { $in: statuses } } });
    }

    const totalFilter = {};
    if (total_low !== undefined) totalFilter.$gte = total_low;
    if (total_high !== undefined) totalFilter.$lte = total_high;
    if (Object.keys(totalFilter).length > 0) {
      pipeline.push({ $match: { total: totalFilter } });
    }

    // Lookups
    pipeline.push(...getDeliveryLookupStages());
    pipeline.push(...getStoreLookupStages());
    pipeline.push(...getProductLookupStages());
    pipeline.push(...getUserLookupStages());
    pipeline.push(...getPaymentLookupStages());

    // Search
    if (searchKey) {
      pipeline.push({
        $match: {
          $or: [
            { "user.name": { $regex: searchKey, $options: "i" } },
            {
              "orderDetails.product.name": { $regex: searchKey, $options: "i" },
            },
            { customerNote: { $regex: searchKey, $options: "i" } },
            { description: { $regex: searchKey, $options: "i" } },
            { cancelNote: { $regex: searchKey, $options: "i" } },
          ],
        },
      });
    }

    // Filter by IDs and fields
    if (searchKey)
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(storeId) },
      });
    if (userId)
      pipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      });
    if (storeId)
      pipeline.push({
        $match: { storeId: new mongoose.Types.ObjectId(storeId) },
      });
    if (processorStaffId) {
      pipeline.push({
        $match: {
          processorStaffId: new mongoose.Types.ObjectId(processorStaffId),
        },
      });
    }
    if (settled !== undefined) pipeline.push({ $match: { settled } });
    if (paymentId)
      pipeline.push({
        $match: { paymentId: new mongoose.Types.ObjectId(paymentId) },
      });
    if (status) pipeline.push({ $match: { status } });

    // Count total orders
    const countPipeline = [...pipeline, { $count: "totalCount" }];
    const countResult = await Order.aggregate(countPipeline);
    const totalOrders = countResult.length > 0 ? countResult[0].totalCount : 0;

    // Sort
    pipeline.push({
      $sort: sortBy
        ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
        : { updatedAt: -1 },
    });

    // Pagination
    if (skip) pipeline.push({ $skip: skip });
    if (limit) pipeline.push({ $limit: limit });

    // Final projection
    pipeline.push(getOrderProjection());

    const orders = await Order.aggregate(pipeline);

    if (!orders) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "No orders found");
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      { orders, totalOrders },
      "Orders retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get Order By Id
// ----------------------------------------------------------------
const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    // Kiểm tra định dạng orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Invalid order ID"
      );
    }

    const objectId = new mongoose.Types.ObjectId(orderId);

    // Xây pipeline lấy chi tiết đơn hàng
    const pipeline = [
      { $match: { _id: objectId } },

      // Thêm thông tin người dùng, cửa hàng, thanh toán, giao hàng, sản phẩm
      ...getUserLookupStages(),
      ...getStoreLookupStages(),
      ...getPaymentLookupStages(),
      ...getDeliveryLookupStages(),
      ...getProductLookupStages(),
    ];
    pipeline.push(getOrderProjection());
    // Thực thi pipeline
    const [order] = await Order.aggregate(pipeline);

    if (!order) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "Order not found");
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      order,
      "Order retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get Order status count
// ----------------------------------------------------------------
const getOrderStatusCounts = async (req, res) => {
  const { storeId } = req.params;
  if (!storeId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing storeId");
  }

  try {
    const result = await Order.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = result.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return response(
      res,
      StatusCodes.OK,
      true,
      statusCounts,
      "Fetch order status count successfully"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Export modules
// ----------------------------------------------------------------
module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrders,
  getOrderStatusCounts,
};
