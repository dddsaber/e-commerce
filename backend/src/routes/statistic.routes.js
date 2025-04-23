const { Router } = require("express");

const {
  getCardWrapperData,
  getTotalAndFeesByStore,
  getRevenueChartData,
  getStoreRevenueStats,
} = require("../controllers/statistic/statistic.controller");

const router = Router();

router.get("/", getCardWrapperData);

router.post("/total-and-fees", getTotalAndFeesByStore);

router.post("/revenue-chart", getRevenueChartData);

router.get("/store-revenue-stats/:storeId", getStoreRevenueStats);

module.exports = router;
