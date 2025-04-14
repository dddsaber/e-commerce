const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const Review = require("../../models/Review.model");
const Product = require("../../models/Product.model");
const Store = require("../../models/Store.model");
const User = require("../../models/User.model");
const mongoose = require("mongoose"); // Import mongoose để sử dụng Types.ObjectId

// ----------------------------------------------------------------
// Handle Add rating
// ----------------------------------------------------------------
const handleAddRating = async (review) => {
  if (!review || typeof review.rating !== "number") return false;

  const product = await Product.findById(review.productId);
  if (!product) return false;

  const store = await Store.findById(product.storeId);
  if (!store) return false;

  product.numberOfRatings += 1;
  product.rating =
    (product.rating * (product.numberOfRatings - 1) + review.rating) /
    product.numberOfRatings;

  await product.save();

  store.statistics.numberOfRatings += 1;
  store.statistics.rating =
    (store.statistics.rating * (store.statistics.numberOfRatings - 1) +
      review.rating) /
    store.statistics.numberOfRatings;

  await store.save();

  return true;
};
// ----------------------------------------------------------------
// Handle Remove rating
// ----------------------------------------------------------------
const handleRemoveRating = async (review) => {
  if (!review || typeof review.rating !== "number") return false;

  const product = await Product.findById(review.productId);
  if (!product) return false;

  const store = await Store.findById(product.storeId);
  if (!store) return false;

  if (product.numberOfRatings > 1) {
    product.numberOfRatings -= 1;
    product.rating =
      (product.rating * (product.numberOfRatings + 1) - review.rating) /
      product.numberOfRatings;
  } else {
    product.rating = 0;
    product.numberOfRatings = 0;
  }

  await product.save();

  if (store.statistics.numberOfRatings > 1) {
    store.statistics.numberOfRatings -= 1;
    store.statistics.rating =
      store.statistics.numberOfRatings > 0
        ? (store.statistics.rating * (store.statistics.numberOfRatings + 1) -
            review.rating) /
          store.statistics.numberOfRatings
        : 0;
  } else {
    store.statistics.rating = 0;
    store.statistics.numberOfRatings = 0;
  }

  await store.save();

  return true;
};

// ----------------------------------------------------------------
// Create Review
// ----------------------------------------------------------------
const createReview = async (req, res) => {
  const { userId, productId, content, rating } = req.body;
  if (!userId || !productId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields: userId, productId"
    );
  }
  if (!content || !rating) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields: content, rating"
    );
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return response(
        res,
        StatusCodes.UNAUTHORIZED,
        false,
        {},
        "User not found or inactive"
      );
    }
    const product = await Product.findById(productId);
    if (!product) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Product not found"
      );
    }

    const newReview = await Review.create({
      userId: userId,
      productId: productId,
      content: content,
      rating: rating,
      isDeleted: false,
    });

    if (!newReview) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create review"
      );
    }

    const updateRatingStatus = await handleAddRating(newReview);
    if (!updateRatingStatus) {
      await Review.findByIdAndDelete(newReview._id);

      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update rating for product or store"
      );
    }

    return response(
      res,
      StatusCodes.CREATED,
      true,
      newReview,
      "Review created successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update Review
// ----------------------------------------------------------------
const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating } = req.body;
  if (!reviewId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required field: reviewId"
    );
  }

  if (!content && !rating) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields: content or rating"
    );
  }
  try {
    let changeRating = false;
    const review = await Review.findById(reviewId);
    if (!review) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Review not found"
      );
    }
    let updateRatingStatus;

    if (rating !== review.rating) {
      updateRatingStatus = await handleRemoveRating(review);

      if (!updateRatingStatus) {
        return response(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          false,
          {},
          "Failed to update rating for product or store"
        );
      }

      changeRating = true;
    }
    const oldReview = await Review.findById(reviewId);

    review.rating = rating;
    review.content = content;
    await review.save();

    if (changeRating) {
      updateRatingStatus = await handleAddRating(review);
      if (!updateRatingStatus) {
        await Review.findByIdAndUpdate(review._id, oldReview);
        return response(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          false,
          {},
          "Failed to update rating for product or store"
        );
      }
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      review,
      "Review updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update Review's status
// ----------------------------------------------------------------
const updateReviewStatus = async (req, res) => {
  const { reviewId } = req.params;
  const { status } = req.body;
  if (!reviewId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required field: reviewId"
    );
  }

  if (status !== true && status !== false) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid status. Status must be 0 or 1"
    );
  }
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isDeleted: status },
      { new: true }
    );
    if (!review) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Review not found"
      );
    } else {
      const product = await Product.findById(review.productId);
      if (!product) {
        return response(
          res,
          StatusCodes.NOT_FOUND,
          false,
          {},
          "Product not found"
        );
      }
      const store = await Store.findById(product.storeId);
      if (!store) {
        return response(
          res,
          StatusCodes.NOT_FOUND,
          false,
          {},
          "Store not found"
        );
      }
      if (review.isDeleted) {
        const updateRatingStatus = await handleRemoveRating(review);
        if (!updateRatingStatus) {
          await Review.findByIdAndUpdate(review._id, { isDeleted: false });

          return response(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            false,
            {},
            "Failed to update rating for product or store"
          );
        }
      } else {
        const updateRatingStatus = await handleAddRating(review);
        if (!updateRatingStatus) {
          await Review.findByIdAndUpdate(review._id, { isDeleted: true });

          return response(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            false,
            {},
            "Failed to update rating for product or store"
          );
        }
      }
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      review,
      "Review's status updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get Reviews
// ----------------------------------------------------------------
const getReviews = async (req, res) => {
  const {
    skip,
    limit,
    sortBy,
    searchKey,
    isDeleteds,
    ratings,
    productId,
    storeId,
  } = req.body;

  try {
    const pipeline = [];

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      }
    );

    pipeline.push({
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] }, // Lấy phần tử đầu tiên của user
      },
    });

    pipeline.push({
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true, // Nếu không có user, vẫn giữ lại store
      },
    });

    pipeline.push({
      $addFields: {
        product: { $arrayElemAt: ["$product", 0] }, // Lấy phần tử đầu tiên của product
      },
    });

    pipeline.push({
      $unwind: {
        path: "$product",
        preserveNullAndEmptyArrays: true, // Nếu không có product, v��n giữ lại store
      },
    });

    if (searchKey) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchKey, $options: "i" } }, // Tìm trong store.statistics.name
            { description: { $regex: searchKey, $options: "i" } }, // Tìm trong store.statistics.description
            { email: { $regex: searchKey, $options: "i" } }, // Tìm trong store.statistics.email
            { phone: { $regex: searchKey, $options: "i" } }, // Tìm trong store.statistics.phone
            { "user.name": { $regex: searchKey, $options: "i" } }, // Tìm trong user.name
            { "user.username": { $regex: searchKey, $options: "i" } }, // Tìm trong user.username
            { "product.name": { $regex: searchKey, $options: "i" } }, // T
          ],
        },
      });
    }

    if (Array.isArray(isDeleteds) && isDeleteds.length > 0) {
      pipeline.push({
        $match: {
          isDeleted: { $in: isDeleteds },
        },
      });
    }

    if (Array.isArray(ratings) && ratings.length > 0) {
      pipeline.push({
        $match: {
          rating: { $in: ratings },
        },
      });
    }

    if (productId) {
      pipeline.push({
        $match: {
          productId: new mongoose.Types.ObjectId(productId), // Chuyển string thành ObjectId
        },
      });
    }

    if (storeId) {
      pipeline.push({
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId), // Chuyển string thành ObjectId
        },
      });
    }

    // Đếm tổng số reviews phù hợp
    const countPipeline = [...pipeline];
    countPipeline.push({
      $count: "totalCount",
    });

    const countResult = await Review.aggregate(countPipeline);

    const totalReviews = countResult.length > 0 ? countResult[0].totalCount : 0;

    pipeline.push({
      $sort: sortBy
        ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
        : { createdAt: -1 },
    });

    if (skip) pipeline.push({ $skip: skip });
    if (limit) pipeline.push({ $limit: parseInt(limit) });

    pipeline.push({
      $project: {
        userId: 1,
        productId: 1,
        content: 1,
        rating: 1,
        isDeleted: 1,
        createdAt: 1,
        updatedAt: 1,
        "product.name": 1,
        "user.username": 1,
        "user.name": 1,
        "user.avatar": 1,
      },
    });

    const reviews = await Review.aggregate(pipeline);

    if (!reviews) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "No reviews found for this product"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      { reviews, totalReviews },
      `Fetch reviews successfully!`
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get Reviews By Product's Id
// ----------------------------------------------------------------
const checkReviewExistence = async (req, res) => {
  const { userId, productId } = req.params;

  // Kiểm tra xem có thiếu tham số không
  if (!productId || !userId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required field: productId or userId"
    );
  }
  // Validate if productId and userId are valid ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid productId or userId"
    );
  }

  // Chuyển productId và userId thành ObjectId
  const productObjectId = new mongoose.Types.ObjectId(productId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // Tìm review trong cơ sở dữ liệu
    const review = await Review.findOne({
      productId: productObjectId,
      userId: userObjectId,
      isDeleted: false,
    });

    if (!review) {
      return response(
        res,
        StatusCodes.OK,
        true,
        { hasReview: false, review: {} },
        "No reviews found for this product"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      { review, hasReview: true },
      "Reviews fetched successfully"
    );
  } catch (error) {
    console.log("Error:", error.message); // Debugging
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get Review By Id
// ----------------------------------------------------------------
const getReviewById = async (req, res) => {
  const { reviewId } = req.params;
  if (!reviewId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required field: reviewId"
    );
  }
  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Review not found"
      );
    }
    if (review.isDeleted) {
      return response(
        res,
        StatusCodes.FORBIDDEN,
        false,
        {},
        "Review has been deleted"
      );
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      review,
      "Review fetched successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------

module.exports = {
  createReview,
  updateReview,
  updateReviewStatus,
  getReviews,
  checkReviewExistence,
  getReviewById,
};
