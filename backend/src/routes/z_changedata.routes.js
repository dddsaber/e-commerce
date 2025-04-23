const { Router } = require("express");
const { changeData } = require("../controllers/changedata.controller");

const router = Router();

router.post("/change-data", changeData);

module.exports = router;
