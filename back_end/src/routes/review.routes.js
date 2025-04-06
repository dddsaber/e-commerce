const { Router } = require("express");
const {
  createReview,
  updateReview,
  updateReviewStatus,
  getReviews,
  getReviewsByProductId,
  getReviewsByUserId,
  getReviewById,
} = require("../controllers/review/review.controller");

const router = Router();

router.post("/create-review", createReview);

router.put("/:reviewId/:userId/:productId", updateReview);

router.put("/:reviewId/update-review-status", updateReviewStatus);

router.post("/get-reviews", getReviews);

router.get("/product/:productId", getReviewsByProductId);

router.get("/user/:userId", getReviewsByUserId);

router.get("/:reviewId", getReviewById);

module.exports = router;
