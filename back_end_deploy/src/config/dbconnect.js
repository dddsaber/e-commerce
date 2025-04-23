const config = {
  app: {
    port: process.env.PORT || 5000,
    authPort: process.env.AUTH_PORT || 5001,
    socketPort: process.env.PORT || 3000,
  },
  db: {
    uri: "mongodb+srv://dddsaber:Nguyenloc3007@cluster0.rf8nt7o.mongodb.net/e-commerce",
  },
};

module.exports = config;
