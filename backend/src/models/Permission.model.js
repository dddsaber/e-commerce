const mongoose = require("mongoose");

const PermissionSchema = mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    // Mỗi permission áp dụng cho một collection nhất định
    resource: {
      type: String, // Ví dụ: 'Payout', 'Order', 'Product'
      required: true,
    },

    // Các quyền cơ bản
    canView: {
      type: Boolean,
      default: false,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission;
