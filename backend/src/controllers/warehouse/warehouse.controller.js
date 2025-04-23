const response = require("../../utils/response.utils");
const Warehouse = require("../../models/Warehouse.model");
const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");

// ----------------------------------------------------------------
// Create a new warehouse
// ----------------------------------------------------------------
const createWarehouse = async (req, res) => {
  const warehouse = req.body;

  if (!warehouse.address || !warehouse.name || !warehouse.logistic_provider) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields"
    );
  }
  try {
    const newWarehouse = await Warehouse.create(warehouse);
    if (!newWarehouse) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create warehouse"
      );
    }

    return response(
      res,
      StatusCodes.CREATED,
      true,
      newWarehouse,
      "Warehouse created successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Update a warehouse
// ----------------------------------------------------------------
const updateWarehouse = async (req, res) => {
  const { warehouseId } = req.params;
  const warehouse = req.body;

  try {
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      warehouseId,
      warehouse,
      { new: true }
    );
    if (!updatedWarehouse) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Warehouse not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updatedWarehouse,
      "Warehouse updated successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Update a warehouse's status
// ----------------------------------------------------------------
const updateWarehouseStatus = async (req, res) => {
  const { warehouseId } = req.params;
  const { status } = req.body;
  try {
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      warehouseId,
      { isActive: status },
      { new: true }
    );
    if (!updatedWarehouse) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Warehouse not found"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      updatedWarehouse,
      `Warehouse's status updated successfully to ${status}`
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get warehouses
// ----------------------------------------------------------------
const getWarehouses = async (req, res) => {
  const {
    skip = 0,
    limit = 10,
    isActive,
    searchKey,
    sortBy,
    isActives,
    logistic_provider,
  } = req.body;

  try {
    const filters = {};

    if (isActive !== undefined) filters.isActive = isActive;
    if (logistic_provider) filters.logistic_provider = logistic_provider;
    if (isActives) filters.isActive = { $in: isActives };

    if (searchKey) {
      filters.$or = [
        { name: { $regex: searchKey, $options: "i" } },
        { "address.ward": { $regex: searchKey, $options: "i" } },
        { "address.district": { $regex: searchKey, $options: "i" } },
        { "address.province": { $regex: searchKey, $options: "i" } },
      ];
    }

    const totalWarehouses = await Warehouse.countDocuments(filters);

    const warehouses = await Warehouse.find(filters)
      .populate("logistic_provider", "name email phone username") // Không cần tên collection
      .sort(
        sortBy
          ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
          : { createdAt: -1 }
      )
      .skip(parseInt(skip, 10))
      .limit(parseInt(limit, 10));

    return response(
      res,
      StatusCodes.OK,
      true,
      { warehouses, totalWarehouses },
      "Warehouses retrieved successfully"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get a warehouse by id
// ----------------------------------------------------------------
const getWarehouseById = async (req, res) => {
  const { warehouseId } = req.params;
  try {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Warehouse not found"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      warehouse,
      "Warehouse retrieved"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get a warehouse by user id
// ----------------------------------------------------------------
const getWarehouseByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const warehouse = await Warehouse.findOne({
      logistic_provider: userId,
      isActive: true,
    });
    if (!warehouse) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Warehouse not found"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      warehouse,
      "Warehouse retrieved"
    );
  } catch (error) {
    handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Export modules
// ----------------------------------------------------------------
module.exports = {
  createWarehouse,
  updateWarehouse,
  updateWarehouseStatus,
  getWarehouses,
  getWarehouseById,
  getWarehouseByUserId,
};
