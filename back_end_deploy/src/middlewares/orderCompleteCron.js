const cron = require("node-cron");
const Order = require("../models/Order.model");

// 🔄 CRON JOB: Tự động cập nhật đơn hàng từ "delivered" sang "completed" sau 7 ngày
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 [CRON JOB] Kiểm tra đơn hàng để cập nhật...");

  try {
    const orders = await Order.find({ status: "delivered" });

    let updatedCount = 0;
    for (const order of orders) {
      const deliveredDate = new Date(order.statusTimestamps.delivered);
      const now = new Date();

      const daysPassed = Math.floor(
        (now - deliveredDate) / (1000 * 60 * 60 * 24)
      );

      if (daysPassed >= 7) {
        order.status = "completed";
        order.statusTimestamps.completed = now;
        await order.save();
        updatedCount++;
      }
    }

    console.log(
      `✅ [CRON JOB] Đã cập nhật ${updatedCount} đơn hàng sang "completed".`
    );
  } catch (error) {
    console.error("❌ [CRON JOB] Lỗi khi cập nhật đơn hàng:", error);
  }
});

console.log("⏳ [CRON JOB] Đã khởi động, sẽ chạy mỗi ngày lúc 00:00.");

module.exports = cron;
