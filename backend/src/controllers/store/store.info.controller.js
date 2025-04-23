const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const User = require("../../models/User.model");
const Store = require("../../models/Store.model");
const Product = require("../../models/Product.model");
const Follow = require("../../models/Follow.model");

const getStoreInfomation = async (req, res) => {
  const { storeId } = req.params;

  try {
    const totalProducts = await Product.countDocuments({
      storeId,
      isActive: true,
    });
    const totalFollowed = await Follow.countDocuments({
      storeId,
      isFollowed: true,
    });
    return response(
      res,
      StatusCodes.OK,
      true,
      {
        totalProducts,
        totalFollowed,
      },
      "Ok"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = {
  getStoreInfomation,
};
