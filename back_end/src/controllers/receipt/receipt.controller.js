const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const Receipt = require("../../models/Receipt.model");
const { updateQuantity } = require("../inventory/inventory.controller");

// ----------------------------------------------------------------
// Create receipt
// ----------------------------------------------------------------
const createReceipt = async (req, res) => {
  const { inventoryId, quantity, provider } = req.body;

  console.log(inventoryId, quantity, provider);

  if (!inventoryId || !quantity) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }

  try {
    const receipt = await Receipt.create({
      inventoryId,
      quantity,
      provider,
    });

    if (!receipt) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Can not create receipt"
      );
    }
    const valid = await updateQuantity(inventoryId, quantity, true);

    if (!valid) {
      await Receipt.findByIdAndDelete(receipt._id);
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update inventory quantity"
      );
    }

    return response(res, StatusCodes.CREATED, true, receipt, quantity);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
  createReceipt,
};
