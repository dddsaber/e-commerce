// controllers/roleController.js
const Role = require("../../models/Role.model");
const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");

const createRole = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Role name is required"
    );
  }

  try {
    const existing = await Role.findOne({ name });
    if (existing) {
      return response(
        res,
        StatusCodes.CONFLICT,
        false,
        {},
        "Role already exists"
      );
    }

    const role = await Role.create({ name });
    return response(res, StatusCodes.CREATED, true, role, "Role created");
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = { createRole };
