// controllers/permissionController.js
const Permission = require("../../models/Permission.model");

const setPermission = async (req, res) => {
  const { roleId, resource, canView, canEdit, canDelete } = req.body;

  if (!roleId || !resource) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Role and resource are required"
    );
  }

  try {
    const updated = await Permission.findOneAndUpdate(
      { roleId, resource },
      { canView: !!canView, canEdit: !!canEdit, canDelete: !!canDelete },
      { upsert: true, new: true }
    );

    return response(res, StatusCodes.OK, true, updated, "Permission updated");
  } catch (error) {
    return handleError(res, error);
  }
};

module.exports = { setPermission };
