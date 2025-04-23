const joi = require("joi");
const { response } = require("../../utils/response.utils");
const { StatusCodes } = require("http-status-codes");
const { TYPE_USER } = require("../../utils/constants.utils");

const validation = joi.object({
  phone: joi.string().max(100),
  email: joi.string().email(),
  password: joi.string().min(8).required(),
  role: joi
    .valid(
      TYPE_USER.admin,
      TYPE_USER.user,
      TYPE_USER.administrative,
      TYPE_USER.sales,
      TYPE_USER.shipper
    )
    .required(),
});

const userValidation = async (req, res, next) => {
  const data = {
    phone: req.body.phone,
    email: req.body.email,
    password: req.body.password,
    role: req.body.userType,
  };
  const { error } = validation.validate(data);
  if (error) {
    let message = `Error in user's data: ${error}`;
    return response(res, StatusCodes.NOT_ACCEPTABLE, false, {}, message);
  } else {
    next();
  }
};

module.exports = { userValidation };
