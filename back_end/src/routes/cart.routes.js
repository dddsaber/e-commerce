const { Router } = require("express");
const {
  addCartItem,
  removeCartItem,
  updateCartItem,
  getCartByUserId,
} = require("../controllers/cart/cart.controller");

const router = Router();

router.post("/:userId/add-cart-item", addCartItem);

router.post("/:userId/remove-cart-item", removeCartItem);

router.put("/:userId/update-cart-item", updateCartItem);

router.get("/:userId/get-cart", getCartByUserId);

module.exports = router;
