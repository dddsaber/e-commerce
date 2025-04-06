const { Router } = require("express");
const {
  createUser,
  updateUser,
  getUsers,
  getUserById,
  changeUserStatus,
  changeUserAddress,
  changeUserPassword,
} = require("../controllers/user/user.controller");

const router = Router();

router.post("/create-user", createUser);

router.put("/:userId/update-user", updateUser);

router.put("/:userId/update-user-status", changeUserStatus);

router.post("/get-users", getUsers);

router.put("/:userId/update-user-address", changeUserAddress);

router.put("/:userId/update-user-password", changeUserPassword);

router.get("/:userId", getUserById);

module.exports = router;
