const { Router } = require("express");
const {
  createReview,
  updateReview,
  updateReviewStatus,
  getReviews,
  getReviewById,
  checkReviewExistence,
} = require("../controllers/review/review.controller");

const router = Router();

router.post("/create-review", createReview);

router.put("/:reviewId/update-review", updateReview);

router.put("/:reviewId/update-review-status", updateReviewStatus);

router.post("/get-reviews", getReviews);

router.get("/exist/:userId/:productId", checkReviewExistence);

router.get("/:reviewId", getReviewById);

module.exports = router;
