const { getReasonPhrase } = require("http-status-codes");

const response = async (res, code, status, data, message) => {
  if (!message) {
    message = getReasonPhrase(code);
  }
  return res.status(code).json({
    status: status,
    message: message,
    data: data,
  });
};

module.exports = response;
