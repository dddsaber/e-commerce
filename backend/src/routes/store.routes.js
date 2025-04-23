const { Router } = require("express");
const {
  registerStore,
  storeInfoRegistration,
  storeTaxRegistration,
  storeIdentityRegistration,
  updateStoreInformation,
  getStoreById,
  updateStoreStatus,
  getStoreByUserId,
  getStores,
  updateStoreAddress,
} = require("../controllers/store/store.controller");

const {
  createPayout,
  getPayouts,
} = require("../controllers/payout/payout.controller");

const {
  updateFollow,
  checkFollow,
} = require("../controllers/follow/follow.controller");

const {
  getStoreInfomation,
} = require("../controllers/store/store.info.controller");

const router = Router();

router.post("/create", registerStore);

router.post("/registration-store-info", storeInfoRegistration);

router.post("/:storeId/registration-store-tax", storeTaxRegistration);

router.post(
  "/:storeId/:userId/registration-store-identity",
  storeIdentityRegistration
);

router.put("/:storeId/update-info", updateStoreInformation);

router.put("/:storeId/update-address", updateStoreAddress);

router.put("/:storeId/update-store-status", updateStoreStatus);

router.get("/user/:userId", getStoreByUserId);

router.get("/:storeId", getStoreById);

router.get("/follow/:storeId/:userId", checkFollow);

router.get("/:storeId/store-info", getStoreInfomation);

router.post("/get-stores", getStores);

router.post("/follow/update-follow", updateFollow);

router.get("/:storeId/create-payout", createPayout);

router.post("/get-payouts", getPayouts);

module.exports = router;
