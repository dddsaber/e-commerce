const response = require("../../utils/response.utils");
const User = require("../../models/User.model");
const {
  generateRandomUsername,
  generateRandomPassword,
  securePassword,
} = require("../../utils/securePassword.utils");
const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");

// ----------------------------------------------------------------
// Create a new User
// ----------------------------------------------------------------
const createUser = async (req, res) => {
  const { name, phone, password, role, ...objUser } = req.body;

  if (!name || !password || !role || !phone) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields: name, password, role, phone"
    );
  }

  try {
    let oldUser = await User.findOne({ phone: phone });
    if (oldUser) {
      return response(
        res,
        StatusCodes.CONFLICT,
        false,
        {},
        "User with this phone number already exists"
      );
    }
    if (objUser && objUser.email) {
      oldUser = await User.findOne({ email: objUser.email });
      if (oldUser) {
        return response(
          res,
          StatusCodes.CONFLICT,
          false,
          {},
          "User with this email already exists"
        );
      }
    }
    if (role === "admin" && req.user.role !== "admin") {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "Only admins can create new admin accounts"
      );
    }
    const hashedPassword = await securePassword(password);
    if (!objUser.username) {
      objUser.username = generateRandomUsername();
    }
    const newUser = await User.create({
      name: name,
      phone: phone,
      password: hashedPassword,
      role: role,
      isActive: true,
      ...objUser,
    });
    if (!newUser) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create user"
      );
    }

    return response(
      res,
      StatusCodes.CREATED,
      true,
      newUser,
      "Success to create user"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update a User
// ----------------------------------------------------------------
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const user = req.body;

  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user ID");
  }
  try {
    const updateUser = await User.findByIdAndUpdate(userId, user, {
      new: true,
    });
    if (!updateUser) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update user"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      updateUser,
      "Success to update user"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get a User by its ID
// ----------------------------------------------------------------
const getUserById = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user ID");
  }
  try {
    const user = await User.findById(userId);

    if (!user) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }

    if (!user.isActive) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "User is inactive"
      );
    }

    return response(res, StatusCodes.OK, true, user, "Success to get user");
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get Users
// ----------------------------------------------------------------
const getUsers = async (req, res) => {
  const { skip, limit, isActive, role, searchKey, sortBy, roles, isActives } =
    req.body;
  try {
    const filters = {};

    if (searchKey) {
      filters.$or = [
        { username: { $regex: searchKey, $options: "i" } },
        { name: { $regex: searchKey, $options: "i" } },
        { email: { $regex: searchKey, $options: "i" } },
        { phone: { $regex: searchKey, $options: "i" } },
        { provider: { $regex: searchKey, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }
    if (role !== undefined) {
      filters.role = role;
    }
    if (roles) {
      filters.role = { $in: roles };
    }
    if (isActives) {
      filters.isActive = { $in: isActives };
    }

    const totalUsers = await User.countDocuments(filters);

    const users = await User.find(filters)
      .sort(
        sortBy
          ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
          : { createdAt: -1 }
      )
      .skip(skip ? skip : null)
      .limit(limit ? limit : null);

    return response(
      res,
      StatusCodes.OK,
      true,
      { users, totalUsers },
      "Users retrieved successfully"
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
// Change a User's account status
// ----------------------------------------------------------------
const changeUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user ID");
  }
  if (status === undefined) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Invalid status");
  }
  try {
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        isActive: status,
      },
      { new: true }
    );

    if (!updateUser) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updateUser,
      "Success to change user status"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Reset a User's password
// ----------------------------------------------------------------
const resetUserPassword = async (req, res) => {};

// ----------------------------------------------------------------
// Change user address
// ----------------------------------------------------------------
const changeUserAddress = async (req, res) => {
  const { userId } = req.params;
  const { address } = req.body;
  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user ID");
  }
  if (!address) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing address");
  }
  try {
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        address: address,
      },
      { new: true }
    );
    if (!updateUser) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      updateUser,
      "Success to change user address"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Change password
// ----------------------------------------------------------------
const changeUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user ID");
  }
  if (!oldPassword || !newPassword) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing password"
    );
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "Invalid password"
      );
    }

    const hashedPassword = await securePassword(newPassword);
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updateUser) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update password"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updateUser,
      "Password changed successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Accept a User's password change
// ----------------------------------------------------------------
const acceptPasswordChange = async (req, res) => {};

// ----------------------------------------------------------------
// Assign role to user
// ----------------------------------------------------------------
const assignRoleToUser = async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;

  if (!roleId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Role ID is required"
    );
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { roleId: roleId },
      { new: true }
    );

    if (!updatedUser) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updatedUser,
      "Role assigned to user"
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// ----------------------------------------------------------------
// Exports modules
// ----------------------------------------------------------------
module.exports = {
  createUser,
  updateUser,
  getUserById,
  getUsers,
  changeUserStatus,
  changeUserAddress,
  changeUserPassword,
  assignRoleToUser,
};
