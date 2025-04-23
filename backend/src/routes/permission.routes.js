const { Router } = require("express");
const {
  setPermission,
} = require("../controllers/permission/permission.controller");

const { createRole } = require("../controllers/role/role.controller");

const router = Router();

router.post("/create-role/:userId", createRole);

router.post("/set-permission", setPermission);

module.exports = router;
