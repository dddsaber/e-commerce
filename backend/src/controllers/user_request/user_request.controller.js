const UserRequest = require("../../models/UserRequest.model");
const { verifyAccessToken } = require("../../middlewares/user.middlewares");

const logUserRequest = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (token) {
      const user = await verifyAccessToken(token);
      if (user) {
        const userId = user._id;
        const pageVisited = req.originalUrl;

        await UserRequest.create({
          userId,
          request: pageVisited,
        });
      }
    }
  } catch (error) {
    console.error("Error logging user request:", error.message);
  }

  next();
};

module.exports = logUserRequest;
