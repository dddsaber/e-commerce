const { StatusCodes } = require("http-status-codes");
const response = require("../../utils/response.utils");
const { handleError } = require("../../utils/error.utils");
const Cart = require("../../models/Cart.model");
const Product = require("../../models/Product.model");
const Inventory = require("../../models/Inventory.model");
const { isAbsolute } = require("path");

// ----------------------------------------------------------------
// Add cart item
// ----------------------------------------------------------------
const addCartItem = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;
  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user ID");
  }
  if (!productId || !quantity || quantity < 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing book ID or invalid quantity"
    );
  }
  try {
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

    const inventory = await Inventory.findOne({ productId: productId });
    if (!inventory) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Inventory not found"
      );
    }

    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      const validQuantity =
        quantity <= inventory.quantity ? quantity : inventory.quantity;
      if (validQuantity <= 0) {
        return response(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          {},
          "Invalid quantity"
        );
      }
      const newCart = new Cart({
        userId: userId,
        items: [{ productId: productId, quantity: validQuantity }],
      });

      await newCart.save();
      return response(
        res,
        StatusCodes.OK,
        true,
        { cart: newCart },
        "Cart successfully"
      );
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      if (cart.items[existingItemIndex].quantity === inventory.quantity) {
        return response(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          {},
          "Quantity exceeds available stock"
        );
      }

      const validQuantity =
        cart.items[existingItemIndex].quantity + quantity <= inventory.quantity
          ? cart.items[existingItemIndex].quantity + quantity
          : inventory.quantity;

      if (validQuantity <= 0) {
        return response(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          {},
          "Invalid quantity"
        );
      }
      cart.items[existingItemIndex].quantity = validQuantity;
    } else {
      const validQuantity =
        quantity <= inventory.quantity ? quantity : inventory.quantity;
      if (validQuantity <= 0) {
        return response(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          {},
          "Invalid quantity"
        );
      }
      cart.items.push({ productId: productId, quantity: validQuantity });
    }
    await cart.save();
    return response(
      res,
      StatusCodes.OK,
      true,
      cart,
      "Cart successfully updated"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while retrieving cart: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Remove cart item
// ----------------------------------------------------------------
const removeCartItem = async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  if (!userId || !productId) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing user ID or product ID"
    );
  }

  try {
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      const newCart = await Cart.create({
        userId: userId,
        items: [],
      });
      return response(
        res,
        StatusCodes.OK,
        true,
        newCart,
        "Cart successfully created"
      );
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return response(
        res,
        StatusCodes.OK,
        true,
        cart,
        "Cart successfully updated"
      );
    } else {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Item not found in the cart"
      );
    }
  } catch (error) {
    return handleError(
      res,
      `An error occurred while retrieving cart: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Update cart item
// ----------------------------------------------------------------
const updateCartItem = async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  if (!userId || !productId || !quantity || quantity < 0) {
    return response(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      {},
      "Missing user ID, product ID, or invalid quantity"
    );
  }

  try {
    const inventory = await Inventory.findOne({ productId: productId });
    if (!inventory) {
      return response(
        res,
        StatusCodes.NOT_FOUND,
        false,
        {},
        "Inventory not found"
      );
    }

    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      const validQuantity =
        quantity <= inventory.quantity ? quantity : inventory.quantity;

      const newCart = await Cart.create({
        userId: userId,
        items: [{ productId: productId, quantity: validQuantity }],
      });
      if (!newCart) {
        return response(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          false,
          {},
          "Failed to create cart"
        );
      }
      return response(
        res,
        StatusCodes.OK,
        true,
        newCart,
        "Cart successfully created"
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      const validQuantity =
        quantity <= inventory.quantity ? quantity : inventory.quantity;
      cart.items[itemIndex].quantity = validQuantity;
    } else {
      const validQuantity =
        quantity <= inventory.quantity ? quantity : inventory.quantity;
      if (validQuantity <= 0) {
        return response(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          {},
          "Invalid quantity"
        );
      }
      cart.items.push({ productId: productId, quantity: validQuantity });
    }
    await cart.save();

    return response(
      res,
      StatusCodes.OK,
      true,
      cart,
      "Cart successfully updated"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while updating cart: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Get cart by user's id
// ----------------------------------------------------------------
const getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return response(res, StatusCodes.BAD_REQUEST, false, {}, "Missing user ID");
  }

  try {
    // 🔹 Populate storeId để lấy tên store
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: "items.productId",
      populate: { path: "storeId", model: "Store" },
    });

    if (!cart) {
      const newCart = await Cart.create({ userId: userId, items: [] });
      if (!newCart) {
        return response(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          false,
          {},
          "Failed to create cart"
        );
      }
      return response(
        res,
        StatusCodes.OK,
        true,
        newCart,
        "Cart successfully created"
      );
    }

    const validItems = [];
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = await Product.findOne({
        _id: item.productId,
        isActive: true,
      });
      if (!product) {
        cart.items.splice(i, 1);
        i--;
        continue;
      }
      const inventory = await Inventory.findOne({ productId: item.productId });
      if (!inventory) {
        cart.items.splice(i, 1);
        i--;
        continue;
      }
      if (inventory.quantity < item.quantity) {
        cart.items[i].quantity = inventory.quantity;
      }
      validItems.push(item);
    }
    cart.items = validItems;
    await cart.save();

    // 🔹 Gom nhóm theo storeId
    const groupedItems = cart.items.reduce((acc, item) => {
      const storeId = item.productId.storeId?._id;
      const storeName = item.productId.storeId?.name || "Unknown Store";
      const storeAddress = item.productId.storeId?.address;
      const logo = item.productId.storeId?.logo || "default.png";

      if (!acc[storeId]) {
        acc[storeId] = {
          storeId,
          storeName,
          storeAddress,
          logo,
          products: [],
        };
      }

      // Loại bỏ storeId và storeName trong từng sản phẩm
      const {
        storeId: _,
        storeName: __,
        storeAddress: ___,
        ...productData
      } = {
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        discount: item.productId.discount,
        image: item.productId.image,
        _id: item._id,
      };

      acc[storeId].products.push(productData);
      return acc;
    }, {});

    return response(
      res,
      StatusCodes.OK,
      true,
      {
        _id: cart._id,
        userId: cart.userId,
        items: Object.values(groupedItems),
      },
      "Cart successfully retrieved"
    );
  } catch (error) {
    return handleError(
      res,
      `An error occurred while retrieving cart: ${error.message}`
    );
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------

module.exports = {
  addCartItem,
  removeCartItem,
  updateCartItem,
  getCartByUserId,
};
