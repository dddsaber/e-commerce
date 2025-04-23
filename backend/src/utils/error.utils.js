const { StatusCodes } = require("http-status-codes");
const response = require("./response.utils");
// ----------------------------------------------------------------
// Helper function for error response
// ----------------------------------------------------------------
const handleError = (res, message) =>
  response(res, StatusCodes.INTERNAL_SERVER_ERROR, false, {}, message);

module.exports = { handleError };
