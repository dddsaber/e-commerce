const { StatusCodes } = require("http-status-codes");
const Order = require("../../models/Order.model");
const Payout = require("../../models/Payout.model");
const Store = require("../../models/Store.model");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const Coupon = require("../../models/Coupon.model");

const getFinalPayout = async (order) => {
  const fees = order.fees || {}; // Đảm bảo không bị undefined
  let total = 0;
  for (const item of order.orderDetails) {
    total += item.price * (1 - item.discount);
  }
  if (order.couponId) {
    const coupon = await Coupon.findById(couponId);
    if (coupon) {
      if (coupon.type === "percentage") {
        couponValue = total * coupon.value;
      } else if (coupon.type === "fixed") {
        couponValue = coupon.value;
      }
    }
  }

  total -=
    (fees.commission || 0) + (fees.transaction || 0) + (fees.service || 0);
  return total;
};

const processWeeklyPayouts = async () => {
  console.log("📆 Đang xử lý thanh toán WEEKLY...");
  try {
    const weeklyShops = await Store.find({ payment_cycle: "weekly" });

    for (const shop of weeklyShops) {
      const orders = await Order.find({
        storeId: shop._id, // ✅ Đúng field trong Order
        status: { $in: ["completed"] },
        settled: false,
      });

      if (orders.length === 0) continue;

      const totalPayout = orders.reduce(
        (sum, order) => sum + getFinalPayout(order),
        0
      );

      await Payout.create({
        storeId: shop._id,
        orders: orders.map((o) => o._id),
        totalPayout,
        status: "pending",
      });

      console.log(
        `✅ Thanh toán WEEKLY cho Store ${shop.name}: ${totalPayout} VNĐ`
      );

      await Order.updateMany(
        { _id: { $in: orders.map((o) => o._id) } },
        { $set: { settled: true } }
      );
    }
  } catch (error) {
    console.error("❌ Lỗi trong processWeeklyPayouts:", error);
  }
};

const processMonthlyPayouts = async () => {
  console.log("📆 Đang xử lý thanh toán MONTHLY...");
  try {
    const monthlyShops = await Store.find({ payment_cycle: "monthly" });

    for (const shop of monthlyShops) {
      const orders = await Order.find({
        storeId: shop._id, // ✅ Đúng field trong Order
        status: { $in: ["completed"] },
        settled: false,
      });

      if (orders.length === 0) continue;

      const totalPayout = orders.reduce(
        (sum, order) => sum + getFinalPayout(order),
        0
      );

      await Payout.create({
        storeId: shop._id,
        orders: orders.map((o) => o._id),
        totalPayout,
        status: "pending",
      });

      console.log(
        `✅ Thanh toán MONTHLY cho Store ${shop.name}: ${totalPayout} VNĐ`
      );

      await Order.updateMany(
        { _id: { $in: orders.map((o) => o._id) } },
        { $set: { settled: true } }
      );
    }
  } catch (error) {
    console.error("❌ Lỗi trong processMonthlyPayouts:", error);
  }
};

const createPayout = async (req, res) => {
  const { storeId } = req.params;
  console.log(storeId);
  if (!storeId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "");
  }
  try {
    const orders = await Order.find({
      storeId: storeId,
      status: { $in: ["completed"] },
      settled: false,
    });

    if (orders.length === 0)
      return response(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        {},
        "Không có đơn hàng nào để kết toán!"
      );

    const totalPayout = (
      await Promise.all(
        orders.map(async (order) => await getFinalPayout(order))
      )
    ).reduce((sum, payout) => sum + payout, 0);

    const payout = await Payout.create({
      storeId: storeId,
      orders: orders.map((o) => o._id),
      totalPayout,
      status: "completed",
    });

    if (!payout) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Không thể kết toán!"
      );
    }

    await Order.updateMany(
      { _id: { $in: orders.map((o) => o._id) } },
      { $set: { settled: true } }
    );

    return response(res, StatusCodes.OK, true, payout, "Thành công kết toán!");
  } catch (error) {
    return handleError(res, error);
  }
};

const getPayouts = async (req, res) => {
  const { skip = 0, limit = 10, sortBy = "createdAt", storeId } = req.body;

  try {
    // Nếu có storeId, tính tổng số kết toán của cửa hàng đó, nếu không có storeId, lấy tất cả các kết toán
    const query = storeId ? { storeId: storeId } : {};

    const totalPayouts = await Payout.countDocuments(query);

    // Truy vấn danh sách kết toán từ Payout với phân trang và sắp xếp
    const payouts = await Payout.find(query)
      .skip(Number(skip)) // Phân trang: bỏ qua 'skip' số bản ghi
      .limit(Number(limit)) // Phân trang: giới hạn 'limit' số bản ghi trả về
      .sort(
        sortBy
          ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
          : { createdAt: -1 }
      ); // Sắp xếp theo trường 'sortBy', 1 là tăng dần, -1 là giảm dần

    return response(
      res,
      StatusCodes.OK,
      true,
      { payouts, totalPayouts },
      "Thành công!"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  processWeeklyPayouts,
  processMonthlyPayouts,
  createPayout,
  getPayouts,
};
