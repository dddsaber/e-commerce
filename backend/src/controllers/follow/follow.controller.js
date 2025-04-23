const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const User = require("../../models/User.model");
const Store = require("../../models/Store.model");
const Follow = require("../../models/Follow.model");

const updateFollow = async (req, res) => {
  const { userId, storeId, isFollowed } = req.body;
  if (!userId || !storeId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required params"
    );
  }

  if (typeof isFollowed !== "boolean") {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing isFollowed"
    );
  }

  try {
    let follow = await Follow.findOne({ userId, storeId });
    if (!follow) {
      follow = await Follow.create({
        userId,
        storeId,
        isFollowed,
      });
    } else {
      follow = await Follow.findOneAndUpdate(
        { userId, storeId },
        { isFollowed },
        { new: true }
      );
    }

    if (!follow) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Can't create"
      );
    }
    return response(res, StatusCodes.OK, true, follow, "OK");
  } catch (error) {
    return handleError(res, error);
  }
};

const checkFollow = async (req, res) => {
  const { userId, storeId } = req.params;
  if (!userId || !storeId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required params"
    );
  }

  try {
    const follow = await Follow.findOne({
      userId,
      storeId,
    });
    return response(res, StatusCodes.OK, true, follow, "OK");
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  updateFollow,
  checkFollow,
};
