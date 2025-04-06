const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const Category = require("../../models/Category.model");
const { handleError } = require("../../utils/error.utils");

// ----------------------------------------------------------------
// Create a new category
// ----------------------------------------------------------------
const createCategory = async (req, res) => {
  const { name, description, parentId, commissionFee } = req.body;

  if (!name || !description) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Name and description are required"
    );
  }

  try {
    const newCategory = await Category.create({
      name,
      description,
      isDeleted: false,
      parentId: parentId || null,
      commissionFee: commissionFee || null,
    });

    return response(
      res,
      StatusCodes.CREATED,
      true,
      newCategory,
      "Category created successfully"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while creating the category: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Update a category
// ----------------------------------------------------------------
const updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { name, description, parentId, isDeleted } = req.body;

  // Kiểm tra các giá trị được cập nhật
  const updatedField = {};
  if (name) updatedField.name = name;
  if (description) updatedField.description = description;
  if (parentId !== undefined) updatedField.parentId = parentId;
  if (isDeleted !== undefined) updatedField.isDeleted = isDeleted;

  if (Object.keys(updatedField).length === 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "No updated category information provided"
    );
  }

  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updatedField },
      { new: true, runValidators: true }
    );

    if (!category) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Category not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      category,
      "Category updated successfully"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while updating the category ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Update a category status
// ----------------------------------------------------------------
const updateCategoryStatus = async (req, res) => {
  const { categoryId } = req.params;
  const { status } = req.body;

  if (!categoryId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "ID is required");
  }

  if (typeof status !== "boolean") {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Status must be a boolean"
    );
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: { isDeleted: status } },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Category not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updatedCategory,
      "Category status updated successfully"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while updating the category status: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Get categories
// ----------------------------------------------------------------
const getCategories = async (req, res) => {
  const { searchKey, limit, sortBy, isDeleteds, skip } = req.body;

  try {
    const filter = {};

    if (searchKey) {
      filter.$or = [
        { name: { $regex: searchKey, $options: "i" } },
        { description: { $regex: searchKey, $options: "i" } },
      ];
    }

    if (isDeleteds && Array.isArray(isDeleteds)) {
      filter.isDeleted = { $in: isDeleteds }; // filter based on array
    }

    const sortCondition = {};
    if (sortBy && ["name", "description", "createdAt"].includes(sortBy.field)) {
      sortCondition[sortBy.field] = sortBy.order === "asc" ? 1 : -1;
    } else {
      sortCondition.createdAt = -1;
    }

    const countResults = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .populate("parentId", "name")
      .skip(Number.isInteger(skip) && skip > 0 ? skip : 0)
      .limit(Number.isInteger(limit) && limit > 0 ? limit : 10)
      .sort(sortCondition);

    return response(
      res,
      StatusCodes.OK,
      true,
      { categories, totalCategories: countResults },
      "Categories retrieved successfully"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while retrieving categories: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Get category by ID with children
// ----------------------------------------------------------------
const getCategoryByParentId = async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "ID is required");
  }

  try {
    let categories;

    // Kiểm tra nếu categoryId là null hoặc rỗng
    if (categoryId === "root") {
      categories = await Category.find({ parentId: null });
    } else {
      categories = await Category.find({ parentId: categoryId });
    }

    if (!categories || categories.length === 0) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Category not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      categories,
      "Category retrieved successfully"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while retrieving the category: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Get category by ID with children
// ----------------------------------------------------------------
const getCategoryById = async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "ID is required");
  }

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Category not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      category,
      "Category retrieved successfully"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while retrieving the category: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Get select categories
// ----------------------------------------------------------------
const getSelectCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      parentId: { $ne: null },
      isDeleted: false,
    });

    if (!categories || categories.length === 0) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "No categories found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      categories,
      "Select categories retrieved successfully"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while retrieving select categories: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------
module.exports = {
  createCategory,
  updateCategory,
  updateCategoryStatus,
  getCategories,
  getCategoryByParentId,
  getCategoryById,
  getSelectCategories,
};
