const { Router } = require("express");

const {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  updateProductStatus,
  getRateAndSold,
} = require("../controllers/product/product.controller");
const {
  recommendProducts,
} = require("../controllers/product/collaborative_filtering.controller");

const router = Router();

router.post("/create-product", createProduct);

router.put("/:productId/update-product", updateProduct);

router.post("/get-products", getProducts);

router.get("/:productId", getProductById);

router.put("/:productId/update-product-status", updateProductStatus);

router.get("/:productId/rate-and-sold", getRateAndSold);

router.get("/recommend/:userId", recommendProducts);

module.exports = router;
