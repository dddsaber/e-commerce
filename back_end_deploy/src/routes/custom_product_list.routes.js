const { Router } = require("express");
const router = Router();

const {
  createCustomProductList,
  getCustomProductLists,
  updateCustomProductListOrder,
  updateCustomProductListStatus,
  updateCustomProductList,
  deleteCustomProductList,
} = require("../controllers/custom_product_list/custom_product_list.controller");

router.post("/create-custom-product-list", createCustomProductList);

router.get("/get-custom-product-list/:storeId", getCustomProductLists);

router.put("/update-custom-product-list-order", updateCustomProductListOrder);

router.put(
  "/update-custom-product-list-status/:id",
  updateCustomProductListStatus
);

router.put("/update-custom-product-list-info/:id", updateCustomProductList);

router.delete("/delete/:id", deleteCustomProductList);

module.exports = router;
