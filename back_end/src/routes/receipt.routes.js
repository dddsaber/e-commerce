const { Router } = require("express");
const { createReceipt } = require("../controllers/receipt/receipt.controller");

const router = Router();

router.post("/create-receipt", createReceipt);

module.exports = router;
