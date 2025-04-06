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

router.get("/:storeId", getStoreById);

router.put("/:storeId/update-store-status", updateStoreStatus);

router.get("/user/:userId", getStoreByUserId);

router.post("/get-stores", getStores);

module.exports = router;
