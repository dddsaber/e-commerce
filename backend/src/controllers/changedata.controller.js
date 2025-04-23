const Category = require("../models/Category.model");
const Order = require("../models/Order.model");
const Permission = require("../models/Permission.model");
const Role = require("../models/Role.model");
const User = require("../models/User.model");
const Warehouse = require("../models/Warehouse.model");
const { TYPE_USER } = require("../utils/constants.utils");
const { getCoordinates } = require("./warehouse/delivery_calculate.controller");

const models = [
  "Coupon",
  "Inventory",
  "Order",
  "Payment",
  "Payout",
  "Permission",
  "Product",
  "Receipt",
  "Report",
  "Review",
  "Role",
  "User",
  "Warehouse",
];

const permissions = {
  canView: 1,
  canEdit: 1,
  canDelete: 1,
};

const changeData = async (req, res) => {
  try {
    // Tìm tất cả user có role là "admin"
    const admins = await User.find({ role: "admin" }).lean();

    // Lấy ra danh sách roleId (nếu có)
    const roleIdSet = new Set();
    for (const admin of admins) {
      if (admin.roleId) {
        roleIdSet.add(admin.roleId.toString());
      }
    }

    let permissionCreated = 0;

    for (const roleId of roleIdSet) {
      for (const model of models) {
        const exists = await Permission.findOne({ roleId, model });
        if (!exists) {
          await Permission.create({
            roleId,
            resource: model,
            ...permissions,
          });
          permissionCreated++;
        }
      }
    }

    return res.status(200).json({
      message: "Permissions created for admin roles",
      totalAdminRoles: roleIdSet.size,
      permissionCreated,
    });
  } catch (error) {
    console.error("Error creating permissions:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { changeData };
