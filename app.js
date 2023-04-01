require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const xss = require("xss-clean");
const path = require("path");

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["OPTIONS", "GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(morgan("tiny"));

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors(corsOptions));
app.use(xss());

app.use(express.json());

app.use("/video", express.static(path.join(__dirname, "video")));

app.use((err, req, res, next) => {
  if (!(err instanceof Error)) {
    err = new Error(err);
    err.status = 500;
  }

  if (!err.status) {
    err.status = 500;
  }

  res.status(err.status).json({ error: err.message });
  next(err);
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
const io = require("socket.io")(server, {
  cors: {
    origin: "https://frabjous-pony-87c0bc.netlify.app",
    methods: ["OPTIONS", "GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  },
});
io.on("connection", (socket) => {
  console.log("Client Connected");
  socket.on("timeUpdate", (currentTime) => {
    socket.broadcast.emit("timeUpdate", currentTime);
  });

  socket.on("playUpdate", (isPlaying) => {
    socket.broadcast.emit("playUpdate", isPlaying);
  });
});
