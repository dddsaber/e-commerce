const { Router } = require("express");

const {
  getDeliveryInfo,
  updateTimeStamp,
  getDeliveries,
} = require("../controllers/delivery/delivery.controller");

const router = Router();

router.post("/get-info", getDeliveryInfo);

router.put("/update-timestamp/:deliveryId/:warehouseId", updateTimeStamp);

router.post("/get-deliveries", getDeliveries);

module.exports = router;
