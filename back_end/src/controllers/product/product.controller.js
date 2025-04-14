const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const Product = require("../../models/Product.model");
const { createInventory } = require("../inventory/inventory.controller");
const Category = require("../../models/Category.model");
const Review = require("../../models/Review.model");
const Inventory = require("../../models/Inventory.model");
const { default: mongoose } = require("mongoose");
const Store = require("../../models/Store.model");

// ----------------------------------------------------------------
// Create a new product
// ----------------------------------------------------------------
const createProduct = async (req, res) => {
  const { categoryId, storeId, name, cost, price, ...objProduct } = req.body;

  if (!categoryId || !storeId || !name || !cost || !price) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required fields: categoryId, storeId, name, cost, price"
    );
  }

  if (typeof cost !== "number" || cost <= 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid cost: must be a positive number"
    );
  }
  if (typeof price !== "number" || price <= 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid price: must be a positive number"
    );
  }

  try {
    const store = await Store.findById(storeId);
    if (!store) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "No store founded!"
      );
    }

    const newProduct = await Product.create({
      categoryId,
      storeId,
      name,
      cost,
      price,
      ...objProduct,
      isActive: true,
      rating: 0,
      numberOfRatings: 0,
    });

    if (!newProduct) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create product!"
      );
    }

    const status = await createInventory(newProduct._id);
    if (!status) {
      await Product.findByIdAndDelete(newProduct._id);
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create inventory for the product! Product creation rolled back."
      );
    }

    store.statistics.totalProducts += 1;
    await store.save();

    return response(
      res,
      StatusCodes.CREATED,
      true,
      newProduct,
      "Product created successfully!"
    );
  } catch (error) {
    return handleError(res, "An error occurred while creating the product");
  }
};

// ----------------------------------------------------------------
// Update a product
// ----------------------------------------------------------------
const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const product = req.body;

  if (!productId || !product) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters: productId and product"
    );
  }

  if (typeof product.cost !== "number" || product.cost <= 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid cost: must be a positive number"
    );
  }

  if (typeof product.price !== "number" || product.price <= 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid price: must be a positive number"
    );
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(productId, product, {
      new: true,
    });
    if (!updatedProduct) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Product not found!"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updatedProduct,
      "Product updated successfully!"
    );
  } catch (error) {
    return handleError(res, "Failed to update product");
  }
};

// ----------------------------------------------------------------
// Get products
// ----------------------------------------------------------------
const getProducts = async (req, res) => {
  const {
    searchKey,
    limit,
    skip,
    sortBy,
    costMin,
    costMax,
    priceMin,
    priceMax,
    storeId,
    rating,
    categoryIds,
    isActives,
  } = req.body;
  console.log(req.body);
  try {
    const pipeline = [];

    pipeline.push({
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "productId",
        as: "inventory",
      },
    });

    pipeline.push({
      $addFields: {
        inventory: { $arrayElemAt: ["$inventory", 0] },
      },
    });

    pipeline.push({
      $unwind: {
        path: "$inventory",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "stores",
        localField: "storeId",
        foreignField: "_id",
        as: "store",
      },
    });

    pipeline.push({
      $addFields: {
        store: { $arrayElemAt: ["$store", 0] },
      },
    });

    pipeline.push({
      $unwind: {
        path: "$store",
        preserveNullAndEmptyArrays: true,
      },
    });

    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    });

    pipeline.push({
      $addFields: {
        category: { $arrayElemAt: ["$category", 0] },
      },
    });

    pipeline.push({
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    });

    if (searchKey) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: searchKey, $options: "i" } },
            { description: { $regex: searchKey, $options: "i" } },
            { "category.name": { $regex: searchKey, $options: "i" } },
            { "store.name": { $regex: searchKey, $options: "i" } },
          ],
        },
      });
    }

    // 🟢 Lọc theo khoảng giá cost
    if (costMin || costMax) {
      const costFilter = {};
      if (costMin) costFilter.$gte = parseFloat(costMin);
      if (costMax) costFilter.$lte = parseFloat(costMax);
      pipeline.push({ $match: { cost: costFilter } });
    }

    // 🟢 Lọc theo khoảng giá price
    if (priceMin || priceMax) {
      const priceFilter = {};
      if (priceMin) priceFilter.$gte = parseFloat(priceMin);
      if (priceMax) priceFilter.$lte = parseFloat(priceMax);
      pipeline.push({ $match: { price: priceFilter } });
      console.log(priceFilter);
    }

    // 🟢 Lọc theo storeId
    if (storeId) {
      pipeline.push({
        $match: { storeId: new mongoose.Types.ObjectId(storeId) },
      });
    }

    // 🟢 Lọc theo categoryIds
    // 🟢 Lọc theo categoryIds và cả parentId nằm trong categoryIds
    // 🟢 Lọc theo categoryIds và cả parentId của category nằm trong categoryIds
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      const categoryObjectIds = categoryIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      pipeline.push(
        {
          // Join với collection categories để lấy thông tin parentId của category
          $lookup: {
            from: "categories", // Tên collection categories trong MongoDB
            localField: "categoryId", // Trường categoryId của sản phẩm
            foreignField: "_id", // Trường _id của category
            as: "category_info", // Đặt alias cho kết quả join
          },
        },
        {
          // Lọc các sản phẩm theo categoryId hoặc category có parentId nằm trong categoryIds
          $match: {
            $or: [
              { categoryId: { $in: categoryObjectIds } }, // Lọc theo categoryId
              {
                "category_info.parentId": { $in: categoryObjectIds }, // Lọc theo parentId của category
              },
            ],
          },
        },
        {
          // Unwind category_info để tách các kết quả từ $lookup
          $unwind: "$category_info",
        }
      );
    }

    // 🟢 Lọc theo isActive
    if (isActives && Array.isArray(isActives) && isActives.length > 0) {
      pipeline.push({ $match: { isActive: { $in: isActives } } });
    }

    // 🟢 Lọc theo rating (VD: rating = 3 -> lấy từ 3.0 đến 3.9)
    if (rating && typeof rating === "number") {
      const ratingFloor = Math.floor(rating);
      console.log(ratingFloor);
      pipeline.push({
        $match: { rating: { $gte: ratingFloor, $lt: ratingFloor + 1 } },
      });
    }

    const countPipeline = [...pipeline];
    countPipeline.push({
      $count: "totalCount",
    });

    const countResult = await Product.aggregate(countPipeline);

    const totalProducts =
      countResult.length > 0 ? countResult[0].totalCount : 0;

    // 🔹 Sắp xếp kết quả (Sorting)
    pipeline.push({
      $sort: sortBy
        ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
        : { createdAt: -1 },
    });

    // 🔹 Phân trang (skip, limit)
    if (skip) pipeline.push({ $skip: skip });
    if (limit) pipeline.push({ $limit: limit });

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        sideImages: 1,
        cost: 1,
        price: 1,
        discount: 1,
        size: 1,
        description: 1,
        rating: 1,
        numberOfRatings: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        "category.name": 1,
        "category._id": 1,
        "store.name": 1,
        "store.logo": 1,
        "inventory._id": 1,
        "inventory.quantity": 1,
        "inventory.reservedQuantity": 1,
        "inventory.soldQuantity": 1,
        "inventory.isActive": 1,
        "inventory.createdAt": 1,
        "inventory.updatedAt": 1,
      },
    });

    // Giới hạn số lượng sản phẩm trả về
    const products = await Product.aggregate(pipeline);

    return response(
      res,
      StatusCodes.OK,
      true,
      { products, totalProducts },
      "Products retrieved successfully!"
    );
  } catch (error) {
    return handleError(res, `Failed to retrieve products: ${error.message}`);
  }
};

// ----------------------------------------------------------------
// Get product by id
// ----------------------------------------------------------------
const getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const [product] = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(productId) } },
      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "productId",
          as: "inventory",
        },
      },
      {
        $unwind: {
          path: "$inventory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      {
        $unwind: {
          path: "$categoryId",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!product) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Product not found!"
      );
    }

    // Đổi tên từ categoryId -> category
    product.category = product.categoryId;
    delete product.categoryId;

    return response(
      res,
      StatusCodes.OK,
      true,
      product,
      "Product retrieved successfully!"
    );
  } catch (error) {
    return handleError(res, "Failed to get product by id");
  }
};

// ----------------------------------------------------------------
// Update product's status
// ----------------------------------------------------------------
const updateProductStatus = async (req, res) => {
  const { productId } = req.params;
  const { status } = req.body;

  if (!productId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required field: productId"
    );
  }

  if (typeof status !== "boolean") {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Invalid status: must be a boolean"
    );
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { isActive: status },
      { new: true }
    );

    if (!updatedProduct) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Product not found!"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updatedProduct,
      "Product status updated successfully!"
    );
  } catch (error) {
    return handleError(
      res,
      `Failed to update product status: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Get product rate and sold quantity
// ----------------------------------------------------------------
const getRateAndSold = async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await Review.find({ productId: productId });

    if (!reviews) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Reviews not found!"
      );
    }

    const totalReviews = reviews.length;
    const rating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews ||
      0;

    const inventory = await Inventory.findOne({ productId: productId });
    if (!inventory) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Inventory not found!"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      { totalReviews, rating, inventory },
      "Product rate and sold quantity retrieved successfully!"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};
// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------
module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  updateProductStatus,
  getRateAndSold,
};
