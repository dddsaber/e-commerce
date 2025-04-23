const { Router } = require("express");
const {
  createCategory,
  updateCategory,
  updateCategoryStatus,
  getCategories,
  getCategoryById,
  getCategoryByParentId,
  getSelectCategories,
} = require("../controllers/category/category.controller");

const router = Router();

router.post("/create-category", createCategory);

router.put("/:categoryId/update-info", updateCategory);

router.put("/:categoryId/update-status", updateCategoryStatus);

router.post("/get-categories", getCategories);

router.get("/:categoryId/get-by-id", getCategoryById);

router.get("/:categoryId/get-by-parentId", getCategoryByParentId);

router.get("/get-select-categories", getSelectCategories);

module.exports = router;
