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
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      populate: { path: "storeId", model: "Store" },
    });

    if (!cart) {
      const newCart = await Cart.create({ userId, items: [] });
      return response(
        res,
        StatusCodes.OK,
        true,
        newCart,
        "Cart successfully created"
      );
    }

    // 🔸 Lọc sản phẩm không hợp lệ + cập nhật số lượng nếu vượt quá tồn kho
    const validItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = item.productId;
        if (!product || !product.isActive) return null;

        const inventory = await Inventory.findOne({ productId: product._id });
        if (!inventory) return null;

        item.quantity = Math.min(item.quantity, inventory.quantity);
        return item;
      })
    );

    cart.items = validItems.filter(Boolean); // Loại bỏ null
    await cart.save();

    // 🔸 Gom nhóm theo storeId
    const groupedItems = {};
    cart.items.forEach((item) => {
      const store = item.productId.storeId;
      const storeId = store?._id?.toString();
      if (!storeId) return;

      if (!groupedItems[storeId]) {
        groupedItems[storeId] = {
          storeId,
          storeName: store.name || "Unknown Store",
          storeAddress: store.address,
          logo: store.logo || "default.png",
          products: [],
        };
      }

      groupedItems[storeId].products.push({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        discount: item.productId.discount,
        image: item.productId.image,
        _id: item._id,
      });
    });

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
