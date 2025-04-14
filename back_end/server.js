require("dotenv").config();
const config = require("./src/config/dbconnect");
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connect } = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cronJobs = require("./src/middlewares/orderCompleteCron");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createChat } = require("./src/controllers/chat/chat.controller");

const app = express();

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

const fileRouter = require("./src/routes/file.routes");
const cartRouter = require("./src/routes/cart.routes");
const categoryRouter = require("./src/routes/category.routes");
const couponRouter = require("./src/routes/coupon.routes");
const notificationRouter = require("./src/routes/notification.routes");
const productRouter = require("./src/routes/product.routes");
const reportRouter = require("./src/routes/report.routes");
const reviewRouter = require("./src/routes/review.routes");
const userRouter = require("./src/routes/user.routes");
const authRouter = require("./src/routes/auth.routes");
const storeRouter = require("./src/routes/store.routes");
const receiptRouter = require("./src/routes/receipt.routes");
const statisticRouter = require("./src/routes/statistic.routes");
const orderRouter = require("./src/routes/order.routes");
const paymentRouter = require("./src/routes/payment.routes");
const changeDataRouter = require("./src/routes/z_changedata.routes");
const chatRouter = require("./src/routes/chat.routes");
const conversationRouter = require("./src/routes/conversation.routes");
const warehouseRouter = require("./src/routes/warehouse.routes");
const deliveryRouter = require("./src/routes/delivery.routes");
const permissionRouter = require("./src/routes/permission.routes");
const askWithGemini = require("./src/controllers/chat-bot/chatBot.controller");
app.use("/auth", authRouter);

app.use("/chat", chatRouter);

app.use("/conversation", conversationRouter);

app.use("/cart", cartRouter);

app.use("/category", categoryRouter);

app.use("/coupon", couponRouter);

app.use("/notification", notificationRouter);

app.use("/product", productRouter);

app.use("/report", reportRouter);

app.use("/review", reviewRouter);

app.use("/user", userRouter);

app.use("/store", storeRouter);

app.use("/receipt", receiptRouter);

app.use("/statistic", statisticRouter);

app.use("/order", orderRouter);

app.use("/payment", paymentRouter);

app.use("/warehouse", warehouseRouter);

app.use("/delivery", deliveryRouter);

app.use("/changedata", changeDataRouter);

app.use("/permission", permissionRouter);

app.use("/file", fileRouter);

// Handle errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Có lỗi xảy ra!" });
});

// Socket.io setup
app.post("/chat-bot", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await askWithGemini(message);
    res.json({ reply: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi khi gọi Gemini" });
  }
});

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("newConversation", (conversation) => {
    console.log("newConversation");
    io.emit("newConversation", conversation);
  });

  socket.on("message", async (data) => {
    const { roomId, message } = data;
    console.log("Message", {
      roomId,
      message,
    });

    const newChat = await createChat(message);
    console.log(newChat);
    // Handle incoming chat messages
    io.to(roomId).emit("message", newChat); // Broadcast the message to all connected clients
  });

  socket.on("joinRoom", (roomId) => {
    console.log("roomId", roomId);
    socket.join(roomId);
  });
});

httpServer.listen(process.env.SOCKET_PORT);

// Start Server
async function startServer() {
  try {
    connect(config.db.uri)
      .then(() => {
        console.log("Database connection established!");
      })
      .catch((error) => {
        console.log("Database connection error!", error);
        process.exit(1);
      });
    app.listen(config.app.port, () => {
      console.log(`Server is running at http://localhost:${config.app.port}`);
    });
  } catch (error) {
    console.log("Cannot connect to the database!", error);
    process.exit(1);
  }
}

startServer();
