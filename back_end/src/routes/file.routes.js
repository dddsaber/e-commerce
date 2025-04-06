const { Router } = require("express");
const { uploadFile, uploadFiles } = require("../controllers/file.controller");

const router = Router();

//api: url/file/__

//File Upload
router.post("/upload/:type", uploadFile);
router.post("/uploads/:type", uploadFiles);

module.exports = router;
