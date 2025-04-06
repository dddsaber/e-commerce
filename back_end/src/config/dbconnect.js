const config = {
  app: {
    port: process.env.PORT || 5000,
    authPort: process.env.AUTH_PORT || 5001,
    socketPort: process.env.PORT || 3000,
  },
  db: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/e-commerce",
  },
};

module.exports = config;
