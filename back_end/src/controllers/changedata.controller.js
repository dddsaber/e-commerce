const Category = require("../models/Category.model");
const Order = require("../models/Order.model");
const Warehouse = require("../models/Warehouse.model");
const { getCoordinates } = require("./warehouse/delivery_calculate.controller");

const changeData = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();

    for (let warehouse of warehouses) {
      const address = `${warehouse.address.ward}, ${warehouse.address.district}, ${warehouse.address.province}`;
      const { lat, lon } = await getCoordinates(address);
      warehouse.location = { type: "Point", coordinates: [lon, lat] };
      await warehouse.save();
    }

    return res.status(200).json({
      message: "Orders updated successfully",
      modifiedCount: warehouses,
    });
  } catch (error) {
    console.error("Error updating orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { changeData };
