const { sign, verify } = require("jsonwebtoken");
const User = require("../models/User.model");
const createAccessToken = (user) => {
  return sign(
    {
      _id: user._id,
      phone: user.phone,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    }
  );
};

const createRefreshToken = (user) => {
  return sign(
    {
      _id: user._id,
      phone: user.phone,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};

// Verify token of requesting access token
const verifyRefreshToken = async (token) => {
  if (!token) return;
  try {
    const payload = verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload._id);

    if (user) {
      return user;
    } else {
      return;
    }
  } catch (error) {
    console.log(error.message);
    return;
  }
};

// Verify token of user request
const verifyAccessToken = async (token) => {
  if (!token) {
    return;
  }
  try {
    const payload = verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload._id);
    if (user) {
      return user;
    } else {
      return;
    }
  } catch (error) {
    return;
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
