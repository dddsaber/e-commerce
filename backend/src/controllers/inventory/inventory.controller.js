const Inventory = require("../../models/Inventory.model");
const response = require("../../utils/response.utils");

// ----------------------------------------------------------------
// Helper function: Validate quantity
// ----------------------------------------------------------------
const validateQuantity = (quantity) => {
  return typeof quantity === "number" && quantity >= 0;
};

// ----------------------------------------------------------------
// Create product's inventory
// ----------------------------------------------------------------
const createInventory = async (productId) => {
  try {
    const existingInventory = await Inventory.findOne({ productId });
    if (existingInventory) {
      console.error("Inventory already exists for productId:", productId);
      return false;
    }
    const inventory = await Inventory.create({
      productId,
      quantity: 0,
      reservedQuantity: 0,
      soldQuantity: 0,
      isActive: true,
    });
    return !!inventory; // Trả về true nếu tạo thành công
  } catch (error) {
    console.error("Error creating inventory:", error);
    return false;
  }
};

// ----------------------------------------------------------------
// Update quantity
// ----------------------------------------------------------------
const updateQuantity = async (inventoryId, quantity, isAdd) => {
  if (!validateQuantity(quantity)) {
    console.error("Invalid quantity:", quantity);
    return false;
  }

  try {
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      console.error("Inventory not found for inventoryId:", inventoryId);
      return false;
    }

    if (!isAdd && inventory.quantity < quantity) {
      console.error(
        "Not enough stock to decrease. Available:",
        inventory.quantity,
        "Requested:",
        quantity
      );
      return false;
    }

    const update = isAdd
      ? { $inc: { quantity: quantity } } // Tăng số lượng
      : { $inc: { quantity: -quantity } }; // Giảm số lượng

    const updatedInventory = await Inventory.findByIdAndUpdate(
      inventoryId,
      update,
      { new: true }
    );

    if (!updatedInventory) {
      console.error(
        "Failed to update inventory. Not enough stock or invalid productId."
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating quantity:", error);
    return false;
  }
};

// ----------------------------------------------------------------
// Update reserved quantity
// ----------------------------------------------------------------
const updateReservedQuantity = async (productId, quantity, isAdd) => {
  if (!validateQuantity(quantity)) {
    console.error("Invalid reserved quantity:", quantity);
    return false;
  }

  try {
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      console.error("Inventory not found for productId:", productId);
      return false;
    }

    if (!isAdd && inventory.reservedQuantity < quantity) {
      console.error(
        "Not enough reserved stock to decrease. Reserved:",
        inventory.reservedQuantity,
        "Requested:",
        quantity
      );
      return false;
    }

    if (isAdd && inventory.quantity < quantity) {
      console.error(
        "Not enough inventory to reserve. Available:",
        inventory.quantity,
        "Requested:",
        quantity
      );
      return false;
    }

    const update = isAdd
      ? { $inc: { quantity: -quantity, reservedQuantity: quantity } }
      : { $inc: { quantity: quantity, reservedQuantity: -quantity } };

    const updatedInventory = await Inventory.findOneAndUpdate(
      { productId },
      update,
      { new: true }
    );

    if (!updatedInventory) {
      console.error("Failed to update reserved quantity.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating reserved quantity:", error);
    return false;
  }
};

// ----------------------------------------------------------------
// Update sold quantity
// ----------------------------------------------------------------
const updateSoldQuantity = async (productId, quantity, isAdd) => {
  if (!validateQuantity(quantity)) {
    console.error("Invalid sold quantity:", quantity);
    return false;
  }

  try {
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      console.error("Inventory not found for productId:", productId);
      return false;
    }

    if (!isAdd && inventory.soldQuantity < quantity) {
      console.error(
        "Not enough sold stock to decrease. Sold:",
        inventory.soldQuantity,
        "Requested:",
        quantity
      );
      return false;
    }

    if (isAdd && inventory.reservedQuantity < quantity) {
      console.error(
        "Not enough reserved inventory to sell. Reserved:",
        inventory.reservedQuantity,
        "Requested:",
        quantity
      );
      return false;
    }

    const update = isAdd
      ? { $inc: { reservedQuantity: -quantity, soldQuantity: quantity } }
      : { $inc: { reservedQuantity: quantity, soldQuantity: -quantity } };

    const updatedInventory = await Inventory.findOneAndUpdate(
      { productId },
      update,
      { new: true }
    );

    if (!updatedInventory) {
      console.error("Failed to update sold quantity.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating sold quantity:", error);
    return false;
  }
};

// ----------------------------------------------------------------
// Update inventory's status
// ----------------------------------------------------------------
const updateInventoryStatus = async (productId, status) => {
  if (typeof status !== "boolean") {
    console.error("Invalid status:", status);
    return false;
  }

  try {
    const inventory = await Inventory.findOne({ productId });
    if (!inventory) {
      console.error("Inventory not found for productId:", productId);
      return false;
    }

    inventory.isActive = status;
    await inventory.save();
    return true;
  } catch (error) {
    console.error("Error updating inventory status:", error);
    return false;
  }
};

// ----------------------------------------------------------------
// Get inventory
// ----------------------------------------------------------------
const getInventory = async (productId) => {
  try {
    const inventory = await Inventory.findOne({ productId });
    return inventory || null; // Trả về null nếu không tìm thấy
  } catch (error) {
    console.error("Error getting inventory:", error);
    return null;
  }
};

// ----------------------------------------------------------------
// Export module
// ----------------------------------------------------------------
module.exports = {
  createInventory,
  updateQuantity,
  updateReservedQuantity,
  updateSoldQuantity,
  updateInventoryStatus,
  getInventory,
};
