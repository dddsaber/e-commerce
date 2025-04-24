const response = require("../../utils/response.utils");
const {
  securePassword,
  generateRandomUsername,
} = require("../../utils/securePassword.utils");
const { StatusCodes } = require("http-status-codes");
const User = require("../../models/User.model");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../utils/config.utils");
const { handleError } = require("../../utils/error.utils");
const { compare } = require("bcrypt");
const Role = require("../../models/Role.model");
const {
  confirmationUrl,
  BOOK_SHOP_EMAIL,
  BOOK_SHOP_PASSWORD,
} = require("../../utils/constants.utils");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ----------------------------------------------------------------
// User registers a new account
// ----------------------------------------------------------------
const register = async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing phone or password"
    );
  }

  try {
    const oldUser = await User.findOne({ phone: phone });
    if (oldUser) {
      return response(
        res,
        StatusCodes.CONFLICT,
        false,
        {},
        "Phone number already exists"
      );
    }
    const hashedPassword = await securePassword(password);
    const username = generateRandomUsername();

    const role = await Role.findOne({ name: "user" });
    const user = await User.create({
      username: username,
      name: name,
      phone: phone,
      password: hashedPassword,
      role: "user",
      roleId: role._id,
      isActive: true,
    });

    if (!user) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create user"
      );
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    if (!accessToken || !refreshToken) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create tokens"
      );
    }

    return response(
      res,
      StatusCodes.CREATED,
      true,
      { user, accessToken, refreshToken },
      "User registered successfully"
    );
  } catch (error) {
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message
    );
  }
};

// ----------------------------------------------------------------
// User logs in a account
// ----------------------------------------------------------------
const login = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing identifier or password"
    );
  }
  try {
    const user = await User.findOne({
      $or: [
        { phone: identifier },
        { username: identifier },
        { email: identifier },
      ],
    }).select("+password");

    if (!user) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "User not found"
      );
    }

    if (!user.isActive) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "User is not blocked"
      );
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "Incorrect password"
      );
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    if (!accessToken || !refreshToken) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create tokens"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      { user, accessToken, refreshToken },
      "User logged in successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// User logs in a account with OAuth2
// ----------------------------------------------------------------
const loginOAuth2 = async (req, res) => {
  const req_user = req.user;
  if (!req_user) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Couldn't login with OAuth2"
    );
  }
  try {
    const user = await User.findOne({
      provider: req_user.provider,
      providerId: req_user.id,
    });
    if (!user) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "User not found"
      );
    }
    if (!user.isActive) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "User's account is blocked"
      );
    }
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    if (!accessToken || !refreshToken) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Error occurred while creating tokens"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      { user, accessToken, refreshToken },
      "Logged in with OAuth2"
    );
  } catch (error) {
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message
    );
  }
};

// ----------------------------------------------------------------
// User logs out a account
// ----------------------------------------------------------------

const logout = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user id");
  }
  try {
    const user = await User.findByIdAndUpdate(id, { refreshToken: null });
    if (!user) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to log out user"
      );
    }

    return response(
      res,
      StatusCodes.NO_CONTENT,
      true,
      {},
      "User logged out successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// User Re-login
// ----------------------------------------------------------------

const reAuth = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing refresh token"
    );
  }
  try {
    const isVerified = await verifyRefreshToken(refreshToken);
    if (!isVerified) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "Invalid refresh token"
      );
    }
    const user = await User.findById(isVerified._id);
    if (!user) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to find user"
      );
    }
    if (!user.isActive) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "User's account is blocked"
      );
    }
    if (user.refreshToken !== refreshToken) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "Refresh token has expired"
      );
    }
    const accessToken = createAccessToken(user);
    if (!accessToken) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create access token"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      { user, accessToken },
      "User re-authenticated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// User requests a new access token
// ----------------------------------------------------------------
const renewAccessToken = async (req, res) => {};

// ----------------------------------------------------------------
// Send mail with the link direct to change password
// ----------------------------------------------------------------
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        { success: false },
        "User not found"
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000;

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = tokenExpiry;
    await user.save();

    // URL navigate to the FORM from FRONTEND
    const ConfirmURL = `${confirmationUrl}/${user._id}?token=${token}`;

    // Tạo đối tượng transporter với thông tin về email server
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: BOOK_SHOP_EMAIL,
        pass: BOOK_SHOP_PASSWORD,
      },
    });

    // Cấu hình email
    let mailOptions = {
      from: BOOK_SHOP_EMAIL, // Email người gửi
      to: email, // Email người nhận
      subject: "Password reset from Shopfinity", // Tiêu đ�� của email
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="color: #333;">Xác nhận tài khoản của bạn</h2>
      <p>Chào mừng bạn đến với Shopfinity!</p>
      <p>Vui lòng nhấn vào nút bên dưới để xác nhận tài khoản của bạn:</p>
      <a href="${ConfirmURL}" style="
        display: inline-block;
        padding: 10px 20px;
        margin-top: 20px;
        color: white;
        background-color: #28a745;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      ">Xác nhận tài khoản</a>
      <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
    </div>
  `,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    return response(
      res,
      StatusCodes.OK,
      true,
      { userId: user._id },
      "Send Mail successfully"
    );
  } catch (error) {
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message
    );
  }
};

// ----------------------------------------------------------------
// Confirm Password
// ----------------------------------------------------------------
const changePasswordOnConfirm = async (req, res) => {
  const { userId, token, password } = req.body;
  try {
    const user = await User.findById(userId);
    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpiry < Date.now()
    ) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Invalid or exprired token"
      );
    }

    const hashedPassword = await securePassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return response(
      res,
      StatusCodes.OK,
      true,
      { user },
      "Password changed successfully"
    );
  } catch (error) {
    return response(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      false,
      {},
      error.message
    );
  }
};

module.exports = {
  register,
  login,
  loginOAuth2,
  logout,
  reAuth,
  renewAccessToken,
  changePasswordOnConfirm,
  forgotPassword,
};
