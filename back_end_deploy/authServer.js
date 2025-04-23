const express = require("express");
const config = require("./src/config/dbconnect");
const cors = require("cors");
const authRouter = require("./src/routes/auth.routes");
const bodyParser = require("body-parser");
const { connect } = require("mongoose");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/auth", authRouter);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/src/view/serverRunning.html"));
});

async function startServer() {
  try {
    connect(config.db.uri)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);
      });
    app.listen(config.app.authPort, () => {
      console.log(`Auth Server is running on port ${config.app.authPort}`); // Start the server and log the port number
    });
  } catch (error) {
    console.error("Server error", error);
    process.exit(1);
  }
}

startServer();
