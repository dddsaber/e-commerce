const response = require("../../utils/response.utils");
const CustomProductList = require("../../models/CustomProductList.model");
const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");

const mongoose = require("mongoose");
const Product = require("../../models/Product.model");

const createCustomProductList = async (req, res) => {
  const { storeId, name, description, image, productIds, order } = req.body;
  if (!storeId || !name || !productIds) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing params");
  }

  if (typeof order !== "number") {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Order không chính xác"
    );
  }
  try {
    const customProductList = await CustomProductList.create({
      storeId,
      name,
      description,
      image,
      productIds,
      order,
      isActive: true,
    });

    if (!customProductList) {
      return handleError(res, "Can't create custom productList");
    }

    return response(
      res,
      StatusCodes.CREATED,
      true,
      customProductList,
      "Create successfullly"
    );
  } catch (error) {
    return handleError(res, "Internal error" + error);
  }
};

const updateCustomProductList = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  try {
    const updated = await CustomProductList.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updated) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Updated failed"
      );
    }

    return response(res, StatusCodes.OK, true, updated, "Updated successfully");
  } catch (error) {
    return handleError(res, error);
  }
};

const getCustomProductLists = async (req, res) => {
  const { storeId } = req.params;
  const { isActive } = req.query; // Lấy giá trị isActive từ query params

  if (!storeId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing storeId");
  }

  try {
    // Build query object
    let query = { storeId };

    // Nếu isActive được truyền vào, thêm điều kiện lọc isActive
    if (isActive !== undefined) {
      query.isActive = isActive === "true"; // Kiểm tra nếu isActive là 'true' (String)
    }

    // Truy vấn danh sách sản phẩm tùy chỉnh
    const lists = await CustomProductList.find(query).sort({ order: 1 }).lean(); // convert sang plain JS object

    // Duyệt từng list và lấy chi tiết sản phẩm tương tự getProductById
    for (const list of lists) {
      const productIds = list.productIds || [];

      const products = await Product.aggregate([
        {
          $match: {
            _id: {
              $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
          },
        },
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

      // Format lại: đổi categoryId => category
      list.products = products.map((p) => {
        p.category = p.categoryId;
        delete p.categoryId;
        return p;
      });

      // Xoá productIds nếu không cần
      delete list.productIds;
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      lists,
      "Lấy danh sách thành công"
    );
  } catch (error) {
    return handleError(res, "Lỗi khi lấy danh sách: " + error.message);
  }
};

const updateCustomProductListOrder = async (req, res) => {
  const { storeId, listIds } = req.body;

  if (!storeId || !Array.isArray(listIds) || listIds.length === 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing storeId or listIds"
    );
  }

  try {
    const updatePromises = listIds.map((id, index) => {
      return CustomProductList.updateOne(
        { _id: id, storeId }, // đảm bảo đúng store
        { $set: { order: index } }
      );
    });

    await Promise.all(updatePromises);

    return response(
      res,
      StatusCodes.OK,
      true,
      {},
      "Thay đổi thứ tự thành công!"
    );
  } catch (error) {
    return handleError(res, "Lỗi khi cập nhật thứ tự: " + error.message);
  }
};

const updateCustomProductListStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await CustomProductList.findByIdAndUpdate(
      id,
      { isActive: status },
      { new: true }
    );
    if (!updated) {
      return handleError(res, error);
    }
    return response(res, StatusCodes.OK, true, updated, "Successfull");
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteCustomProductList = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteCustom = await CustomProductList.findByIdAndDelete(id);
    return response(
      res,
      StatusCodes.OK,
      true,
      deleteCustom,
      "Delete successful"
    );
  } catch (error) {
    return handleError(res, error);
  }
};
module.exports = {
  createCustomProductList,
  getCustomProductLists,
  updateCustomProductListOrder,
  updateCustomProductListStatus,
  updateCustomProductList,
  deleteCustomProductList,
};
