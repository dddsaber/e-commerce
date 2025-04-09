const Category = require("../models/Category.model");
const Order = require("../models/Order.model");
const Role = require("../models/Role.model");
const User = require("../models/User.model");
const Warehouse = require("../models/Warehouse.model");
const { TYPE_USER } = require("../utils/constants.utils");
const { getCoordinates } = require("./warehouse/delivery_calculate.controller");

const changeData = async (req, res) => {
  try {
    const users = await User.find();
    let updatedCount = 0;

    for (const user of users) {
      const currentRoleId = user.role;

      // Nếu role hiện tại là ObjectId dạng string
      if (
        typeof currentRoleId === "string" &&
        currentRoleId.match(/^[0-9a-fA-F]{24}$/)
      ) {
        const roleDoc = await Role.findById(currentRoleId);

        if (roleDoc) {
          // Cập nhật lại user:
          // - Gán role (string) = roleDoc.name
          // - Gán roleId = ObjectId(roleDoc._id)
          await User.findByIdAndUpdate(user._id, {
            role: roleDoc.name,
            roleId: roleDoc._id,
          });
          updatedCount++;
        }
      }
    }

    return res.status(200).json({
      message: "Repaired user roles and added roleId",
      updatedCount,
    });
  } catch (error) {
    console.error("Error fixing user roles:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { changeData };
