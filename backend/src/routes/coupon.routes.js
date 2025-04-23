const { Router } = require("express");
const {
  createCoupon,
  updateCoupon,
  getCoupons,
  getCouponsById,
  updateCouponStatus,
  applyCouponToStore,
  getValidCoupons,
} = require("../controllers/coupon/coupon.controller");

const router = Router();

router.post("/create-coupon", createCoupon);

router.put("/:couponId/update-coupon", updateCoupon);

router.post("/get-coupons", getCoupons);

router.get("/:couponId", getCouponsById);

router.get("/valid-coupons/:storeId", getValidCoupons);

router.put("/:couponId/update-coupon-status", updateCouponStatus);

router.post("/apply-to-store", applyCouponToStore);

module.exports = router;
