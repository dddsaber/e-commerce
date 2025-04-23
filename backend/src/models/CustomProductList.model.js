const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schema cho danh sách sản phẩm
const customProductListSchema = new Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store", // Liên kết tới cửa hàng
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String, // URL ảnh đại diện
      required: false, // Optional
    },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Liên kết tới các sản phẩm
        required: true,
      },
    ],
    order: {
      type: Number, // Thứ tự của danh sách
      required: true,
    },
    isActive: {
      type: Boolean,
      require: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo một index cho trường `order` để hỗ trợ tìm kiếm nhanh hơn khi sắp xếp
customProductListSchema.index({ order: 1 });

module.exports = mongoose.model("CustomProductList", customProductListSchema);
