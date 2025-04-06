const Order = require("../../models/Order.model");
const Payout = require("../../models/Payout.model");
const Store = require("../../models/Store.model");

const getFinalPayout = (order) => {
  const fees = order.fees || {}; // Đảm bảo không bị undefined
  return (
    order.total -
    ((fees.commission || 0) + (fees.transaction || 0) + (fees.service || 0))
  );
};

const processWeeklyPayouts = async () => {
  console.log("📆 Đang xử lý thanh toán WEEKLY...");
  try {
    const weeklyShops = await Store.find({ payment_cycle: "weekly" });

    for (const shop of weeklyShops) {
      const orders = await Order.find({
        storeId: shop._id, // ✅ Đúng field trong Order
        status: { $in: ["completed", "delivered"] },
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
        status: { $in: ["completed", "delivered"] },
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

module.exports = { processWeeklyPayouts, processMonthlyPayouts };
