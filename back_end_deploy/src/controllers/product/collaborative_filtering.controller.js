const Product = require("../../models/Product.model");
const Order = require("../../models/Order.model");
const response = require("../../utils/response.utils");
const { StatusCodes } = require("http-status-codes");
const { handleError } = require("../../utils/error.utils");
// Lấy lịch sử mua hàng của người dùng
async function getUserPurchaseHistory() {
  const orders = await Order.find({}, "userId orderDetails.productId");
  const userProductMap = {};

  for (const order of orders) {
    const userId = order.userId.toString();
    const productIds = order.orderDetails.map((item) =>
      item.productId.toString()
    );

    if (!userProductMap[userId]) {
      userProductMap[userId] = new Set();
    }

    productIds.forEach((pid) => userProductMap[userId].add(pid));
  }

  return userProductMap;
}

// Tính cosine similarity giữa 2 tập sản phẩm
function cosineSimilarity(setA, setB) {
  const intersection = [...setA].filter((item) => setB.has(item)).length;
  const similarity =
    intersection / (Math.sqrt(setA.size) * Math.sqrt(setB.size));
  return similarity;
}

// Controller: Gợi ý sản phẩm
const recommendProducts = async (req, res) => {
  const currentUserId = req.params.userId;
  const topN = 12;

  try {
    const userHistory = await getUserPurchaseHistory();

    if (!userHistory[currentUserId]) {
      return response(res, StatusCodes.OK, true, {}, "");
    }

    const similarities = [];

    for (const [userId, productSet] of Object.entries(userHistory)) {
      if (userId === currentUserId) continue;

      const sim = cosineSimilarity(userHistory[currentUserId], productSet);
      similarities.push({ userId, similarity: sim });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);

    const recommended = new Set();

    for (const similarUser of similarities.slice(0, 3)) {
      const otherProducts = userHistory[similarUser.userId];
      for (const pid of otherProducts) {
        if (!userHistory[currentUserId].has(pid)) {
          recommended.add(pid);
        }
      }
    }

    const products = await Product.find({
      _id: { $in: [...recommended] },
      isActive: true,
    }).limit(topN);

    return response(
      res,
      StatusCodes.OK,
      true,
      products,
      "Lọc cộng tác hoàn thành!"
    );
  } catch (error) {
    return handleError(res, "Error");
  }
};

module.exports = { recommendProducts };
