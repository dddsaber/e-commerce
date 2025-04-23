const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    name: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "default.jpg",
    },
    sideImages: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
    },
    size: {
      type: [String],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numberOfRatings: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
    },
    width: {
      type: Number,
    },
    length: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
