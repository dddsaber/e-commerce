const joi = require("joi");
const response = require("../../utils/response.utils");
const { StatusCodes } = require("http-status-codes");

const validation = joi.object({
  phone: joi.string().max(100).required(),
  password: joi.string().min(8).max(100).required(),
});

const authValidation = async (req, res, next) => {
  const data = {
    phone: req.body.phone,
    password: req.body.password,
  };

  const { error } = validation.validate(data);
  if (error) {
    return response(res, StatusCodes.NOT_ACCEPTABLE, false, {}, message);
  } else {
    next();
  }
};

module.exports = authValidation;
