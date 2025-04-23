const Warehouse = require("../../models/Warehouse.model");

const getCoordinates = async (location) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    location
  )}&format=json&addressdetails=1&limit=1`;
  const response = await fetch(url, {
    headers: { "User-Agent": "MyApp/1.0" }, // Thêm User-Agent hợp lệ
  });
  const data = await response.json();

  if (data.length === 0) {
    throw new Error(`Không tìm thấy tọa độ cho địa điểm: ${location}`);
  }

  const { lat, lon } = data[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon) };
};
const getDistance = async (coord1, coord2) => {
  const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coord1.lon},${coord1.lat};${coord2.lon},${coord2.lat}?overview=full`;
  const response = await fetch(osrmUrl);
  const data = await response.json();

  if (data.routes.length === 0) {
    throw new Error("Không tính được khoảng cách giữa hai vị trí.");
  }

  return data.routes[0].distance / 1000; // Khoảng cách trả về theo mét -> đổi sang km
};

const calculateDistance = async (
  location2,
  location1 = "Hưng Lợi, Ninh Kiều, Cần Thơ"
) => {
  try {
    if (!location1 || !location2) {
      throw new Error("Vui lòng nhập địa điểm 1 và địa điểm 2.");
    }
    // Lấy tọa độ hai địa điểm
    const coord1 = await getCoordinates(location1);
    const coord2 = await getCoordinates(location2);

    // Tính khoảng cách giữa hai tọa độ
    const distance = await getDistance(coord1, coord2);

    return Math.round(distance, 2);
  } catch (error) {
    console.error("Lỗi:", error.message);
  }
};

const calculateShippingDetails = (distance) => {
  let fee, estimatedDays;

  if (distance < 20) {
    fee = 10000;
    estimatedDays = 1;
  } else if (distance < 50) {
    fee = 20000;
    estimatedDays = 2;
  } else if (distance < 100) {
    fee = 30000;
    estimatedDays = 3;
  } else {
    fee = 50000;
    estimatedDays = 5;
  }

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

  return {
    shippingFee: fee,
    estimatedDate: estimatedDate.toISOString().split("T")[0], // Định dạng YYYY-MM-DD
  };
};

// Tìm kho hàng gần nhất
const findNearestWarehouse = async (address) => {
  try {
    const coords = await getCoordinates(address);

    const warehouse = await Warehouse.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [coords.lon, coords.lat],
          },
          $maxDistance: 100000, // Giới hạn phạm vi tìm kiếm (50km)
        },
      },
    });

    return warehouse;
  } catch (error) {
    console.error("Lỗi:", error.message);
    return null;
  }
};

module.exports = {
  getCoordinates,
  calculateDistance,
  calculateShippingDetails,
  findNearestWarehouse,
};
