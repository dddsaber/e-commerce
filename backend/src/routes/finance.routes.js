const { Router } = require("express");
const {
  createFinance,
  updateFinance,
  getFinanceByUserId,
} = require("../controllers/finance/finance_api.controller");

const router = Router();

router.post("/create-finance", createFinance);

router.put("/update-finance/:id", updateFinance);

router.get("/get-finance/:userId", getFinanceByUserId);

module.exports = router;
