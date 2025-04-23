const Finance = require("../../models/Finance.model");
const response = require("../../utils/response.utils");
const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");

// ----------------------------------------------------------------
// Create a new finance information
// ----------------------------------------------------------------
const createFinance = async (req, res) => {
  const { userId, bankAccountNumber, bankName, accountHolder } = req.body;

  if (!userId || !bankAccountNumber || !bankName || !accountHolder) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required params"
    );
  }

  try {
    const finance = await Finance.create({
      userId,
      bankAccountNumber,
      bankName,
      accountHolder,
      isActive: true,
    });

    if (!finance) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Can't create finance"
      );
    }
    return response(
      res,
      StatusCodes.CREATED,
      true,
      finance,
      "Successfull create"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Get finance buy userId
// ----------------------------------------------------------------
const getFinanceByUserId = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing userId param"
    );
  }

  try {
    const finance = await Finance.findOne({ userId });

    if (!finance) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        true,
        {},
        "Finance information not found"
      );
    }

    return response(res, StatusCodes.OK, true, finance, "Success");
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// update a new finance information
// ----------------------------------------------------------------
const updateFinance = async (req, res) => {
  const { id } = req.params;
  const record = req.body;

  if (!id) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing userId in body"
    );
  }

  try {
    const updated = await Finance.findByIdAndUpdate(
      id,
      { record },
      { new: true }
    );

    if (!updated) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Finance info not found to update"
      );
    }

    return response(res, StatusCodes.OK, true, updated, "Update successful");
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  createFinance,
  updateFinance,
  getFinanceByUserId,
};
