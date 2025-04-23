const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const User = require("../../models/User.model");
const Store = require("../../models/Store.model");
const { createFinancialInformation } = require("../finance/finance.controller");
const {
  findNearestWarehouse,
} = require("../warehouse/delivery_calculate.controller");
const mongoose = require("mongoose");

// ----------------------------------------------------------------
// Register a store
// ----------------------------------------------------------------
const registerStore = async (req, res) => {
  const {
    userId,
    name,
    description,
    phone,
    email,
    logo,
    address,
    financeInfomation,
  } = req.body;

  if (
    !userId ||
    !name ||
    !description ||
    !phone ||
    !email ||
    !logo ||
    !address ||
    !financeInfomation
  ) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }

  try {
    const location = `${address.ward}, ${address.district}, ${address.province}`;
    const warehouse = await findNearestWarehouse(location);
    if (!warehouse) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Chưa hỗ trợ giao hàng khu vực này!"
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }

    const statistics = {
      totalProducts: 0,
      monthlyRevenue: 0,
      rating: 0,
      numberOfRatings: 0,
      totalRevenue: 0,
      visited: 0,
    };

    const store = await Store.create({
      userId: userId,
      name: name,
      description: description,
      phone: phone,
      email: email,
      logo: logo,
      statistics: statistics,
      address: address,
      warehouseId: warehouse._id,
      isActive: true,
    });

    if (!store) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to register store"
      );
    }

    const financeCreated = await createFinancialInformation(
      userId,
      financeInfomation.bankAccount,
      financeInfomation.bankName,
      financeInfomation.accountHolder
    );

    if (!financeCreated) {
      store.isActive = false;
      await store.save();

      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create financial information"
      );
    }
    return response(res, StatusCodes.CREATED, true, store, "Store Information");
  } catch (error) {
    return handleError(res, error.message);
  }
};

// Store's registration - store information
const storeInfoRegistration = async (req, res) => {
  const { userId, name, phone, email, address } = req.body;
  if (!userId || !name || !phone || !email || !address) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }

  try {
    const location = `${address.ward}, ${address.district}, ${address.province}`;
    const warehouse = await findNearestWarehouse(location);
    if (!warehouse) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Chưa hỗ trợ giao hàng khu vực này!"
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }
    let store = await Store.findOne({ userId: user._id });
    if (!store) {
      store = await Store.create({
        userId: userId,
        name: name,
        phone: phone,
        email: email,
        address: address,
        warehouseId: warehouse._id,
        taxInfomation: {
          receiveEInvoiceEmail: email,
          businessRegistrationAddress: address,
        },
        isActive: false,
      });
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    } else {
      store = await Store.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            name: name,
            phone: phone,
            email: email,
            address: address,
            taxInfomation: {
              receiveEInvoiceEmail: email,
              businessRegistrationAddress: address,
            },
          },
        },
        { new: true }
      ).exec();
    }

    if (!store) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to create store"
      );
    }
    return response(res, StatusCodes.CREATED, true, store, "Store Information");
  } catch (error) {
    return handleError(res, error.message);
  }
};
// Store tax registration
const storeTaxRegistration = async (req, res) => {
  const { storeId } = req.params;
  const taxInformation = req.body;
  if (!storeId || !taxInformation) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }

  try {
    const store = await Store.findByIdAndUpdate(storeId, {
      taxInformation: taxInformation,
    });
    if (!store) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update store"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      store,
      "Store updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// Identity registration
const storeIdentityRegistration = async (req, res) => {
  const { userId, storeId } = req.params;
  const {
    fullname,
    identityNumber,
    identityCardFrontImage,
    identityCardBackImage,
  } = req.body;

  if (!userId || !storeId || !fullname || !identityNumber) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }
  try {
    const user = await User.findByIdAndUpdate(userId, {
      identityCard: {
        fullname: fullname,
        identityNumber: identityNumber,
        identityCardFrontImage: identityCardFrontImage,
        identityCardBackImage: identityCardBackImage,
      },
      role: "sales",
    });
    if (!user) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "User not found");
    }
    const statistics = {
      totalProducts: 0,
      monthlyRevenue: 0,
      rating: 0,
      numberOfRatings: 0,
      totalRevenue: 0,
      visited: 0,
    };
    const store = await Store.findByIdAndUpdate(storeId, {
      statistics: statistics,
      isActive: true,
      registrationDate: new Date(),
    });
    if (!store) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Failed to update store"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      store,
      "Store updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update store information
// ----------------------------------------------------------------
const updateStoreInformation = async (req, res) => {
  const storeId = req.params.storeId;
  const store = req.body;

  console.log(store);

  if (!store || !storeId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }

  try {
    const updatedStore = await Store.findByIdAndUpdate(storeId, store, {
      new: true,
    });
    if (!updatedStore) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "Store not found");
    }
    return response(
      res,
      StatusCodes.OK,
      true,
      updatedStore,
      "Store information updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update store address
// ----------------------------------------------------------------
const updateStoreAddress = async (req, res) => {
  const { storeId } = req.params;
  const { address } = req.body;

  if (!storeId || !address) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }
  try {
    const location = `${address.ward}, ${address.district}, ${address.province}`;
    const warehouse = await findNearestWarehouse(location);
    if (!warehouse) {
      return response(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        {},
        "Chưa hỗ trợ giao hàng khu vực này!"
      );
    }

    const updateStore = await Store.findByIdAndUpdate(
      storeId,
      { address, warehouseId: warehouse._id },
      { new: true }
    );
    if (!updateStore) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "Store not found");
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updateStore,
      "Store address updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get store by id
// ----------------------------------------------------------------
const getStoreById = async (req, res) => {
  const { storeId } = req.params;
  if (!storeId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }
  try {
    const store = await Store.findById(storeId).populate(
      "userId",
      "_id name username email"
    );

    if (!store) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "Store not found");
    }

    // Đặt user vào thuộc tính user (thay vì userId)
    const storeData = store.toObject();
    storeData.user = storeData.userId;
    delete storeData.userId;

    return response(res, StatusCodes.OK, true, storeData, "Store information");
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Update Store Status
// ----------------------------------------------------------------
const updateStoreStatus = async (req, res) => {
  const storeId = req.params.storeId;
  const { status } = req.body;
  if (!storeId || typeof status !== "boolean") {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }
  try {
    const updateStore = await Store.findByIdAndUpdate(
      storeId,
      { isActive: status },
      { new: true }
    );
    if (!updateStore) {
      return response(res, StatusCodes.NOT_FOUND, false, {}, "Store not found");
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      updateStore,
      "Store status updated successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get store by userId
// ----------------------------------------------------------------
const getStoreByUserId = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing required parameters"
    );
  }
  try {
    const store = await Store.findOne({ userId: userId });

    return response(res, StatusCodes.OK, true, store, "Store information");
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Get stores
// ----------------------------------------------------------------
const getStores = async (req, res) => {
  const { skip, limit, isActives, searchKey, sortBy } = req.body;

  try {
    const pipeline = [];

    // 🔹 Lookup để lấy thông tin user từ userId
    pipeline.push({
      $lookup: {
        from: "users", // Collection "users"
        localField: "userId", // userId trong store
        foreignField: "_id", // _id trong users
        as: "user", // Kết quả là một mảng user
      },
    });

    // 🔹 Chuyển user từ mảng thành object
    pipeline.push({
      $addFields: {
        user: { $arrayElemAt: ["$user", 0] }, // Lấy phần tử đầu tiên của user
      },
    });

    // 🔹 Unwind để giữ user là object, không phải array (nếu không có user vẫn giữ store)
    pipeline.push({
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true, // Nếu không có user, vẫn giữ lại store
      },
    });

    // 🔹 Nếu có searchKey, thực hiện tìm kiếm trong store & user
    if (searchKey) {
      pipeline.push({
        $match: {
          $or: [
            { _id: { $regex: searchKey, $options: "i" } },
            { name: { $regex: searchKey, $options: "i" } }, // Tìm trong store.name
            { description: { $regex: searchKey, $options: "i" } }, // Tìm trong store.description
            { email: { $regex: searchKey, $options: "i" } }, // Tìm trong store.email
            { phone: { $regex: searchKey, $options: "i" } }, // Tìm trong store.phone
            { "user.name": { $regex: searchKey, $options: "i" } }, // Tìm trong user.name
            { "user.username": { $regex: searchKey, $options: "i" } }, // Tìm trong user.username
          ],
        },
      });
    }

    // 🔹 Lọc theo trạng thái hoạt động (isActive)
    if (Array.isArray(isActives) && isActives.length > 0) {
      pipeline.push({
        $match: {
          isActive: { $in: isActives },
        },
      });
    }

    // Đếm tổng số reviews phù hợp
    const countPipeline = [...pipeline];
    countPipeline.push({
      $count: "totalCount",
    });

    const countResult = await Store.aggregate(countPipeline);

    const totalStores = countResult.length > 0 ? countResult[0].totalCount : 0;

    // 🔹 Sắp xếp kết quả (Sorting)
    pipeline.push({
      $sort: sortBy
        ? { [sortBy.field]: sortBy.order === "asc" ? 1 : -1 }
        : { createdAt: -1 },
    });

    // 🔹 Phân trang (skip, limit)
    if (skip) pipeline.push({ $skip: skip });
    if (limit) pipeline.push({ $limit: limit });

    // 🔹 Chỉ lấy các trường cần thiết để giảm tải dữ liệu
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        logo: 1,
        description: 1,
        email: 1,
        phone: 1,
        statistics: 1,
        address: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        userId: 1,
        "user.name": 1,
        "user.username": 1,
        "user.email": 1,
      },
    });

    const stores = await Store.aggregate(pipeline);

    if (!stores || stores.length === 0) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Stores not found"
      );
    }

    return response(
      res,
      StatusCodes.OK,
      true,
      { stores, totalStores },
      "Stores retrieved successfully"
    );
  } catch (error) {
    return handleError(res, error.message);
  }
};

// ----------------------------------------------------------------
// Export modules
// ----------------------------------------------------------------
module.exports = {
  registerStore,
  updateStoreInformation,
  getStoreById,
  updateStoreStatus,
  getStoreByUserId,
  getStores,
  storeInfoRegistration,
  storeTaxRegistration,
  storeIdentityRegistration,
  updateStoreAddress,
};
