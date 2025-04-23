const { Router } = require("express");

const {
  createWarehouse,
  updateWarehouse,
  updateWarehouseStatus,
  getWarehouses,
  getWarehouseById,
  getWarehouseByUserId,
} = require("../controllers/warehouse/warehouse.controller");

const router = Router();

router.post("/create-warehouse", createWarehouse);

router.put("/update-warehouse/:warehouseId", updateWarehouse);

router.put("/update-warehouse-status/:warehouseId", updateWarehouseStatus);

router.get("/get-warehouses", getWarehouses);

router.get("/get-by-id/:warehouseId", getWarehouseById);

router.get("/get-warehouse-by-user/:userId", getWarehouseByUserId);

module.exports = router;
