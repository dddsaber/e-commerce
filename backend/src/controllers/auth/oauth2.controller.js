const axios = require("axios");
const User = require("../../models/User.model");
const { generateRandomUsername } = require("../../utils/securePassword.utils");
const {
  createAccessToken,
  createRefreshToken,
} = require("../../utils/config.utils");
const response = require("../../utils/response.utils");
const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");
const Role = require("../../models/Role.model");

// ----------------------------------------------------------------
// Login with Google
// ----------------------------------------------------------------
const loginWithGoogle = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Invalid token");
  }
  try {
    const oauth2response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );
    let user = await User.findOne({
      provider: "google",
      providerId: oauth2response.data.sub,
    });
    if (!user) {
      const role = await Role.findOne({ name: "user" });

      user = await User.create({
        provider: "google",
        providerId: oauth2response.data.sub,
        name: oauth2response.data.name,
        email: oauth2response.data.email,
        avatar: oauth2response.data.picture,
        username: oauth2response.data.username ?? generateRandomUsername(),
        isActive: true,
        role: "user",
        roleId: role._id,
      });
    }
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    user.save();

    return response(
      res,
      StatusCodes.OK,
      true,
      {
        accessToken,
        refreshToken,
        user,
      },
      "Login with Google successful"
    );
  } catch (error) {
    console.error(error);
    handleError(res, error.message);
  }
};

module.exports = {
  loginWithGoogle,
};
