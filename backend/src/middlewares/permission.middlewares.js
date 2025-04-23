const Permission = require("../models/Permission.model");
const { verifyAccessToken } = require("./user.middlewares");
const { StatusCodes } = require("http-status-codes");
const response = require("../utils/response.utils");

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "Authentication token not found"
      );
    }

    try {
      const user = await verifyAccessToken(token);

      if (!user || !user.role) {
        return response(
          res,
          StatusCodes.FORBIDDEN,
          false,
          {},
          "User or role not found"
        );
      }

      const permission = await Permission.findOne({
        role: user.role,
        resource,
      });

      if (!permission) {
        return response(
          res,
          StatusCodes.FORBIDDEN,
          false,
          {},
          `No permission set for role on ${resource}`
        );
      }

      const actionField = `can${capitalize(action)}`;

      if (!permission[actionField]) {
        return response(
          res,
          StatusCodes.FORBIDDEN,
          false,
          {},
          `Permission denied: cannot ${action} ${resource}`
        );
      }

      req.user = user; // Gán lại user nếu cần dùng sau này
      next();
    } catch (error) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        error,
        error.message || "Unauthorized"
      );
    }
  };
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

module.exports = checkPermission;
