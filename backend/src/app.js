const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

// ======================================================
// SECURITY & PERFORMANCE
// ======================================================

app.use(helmet());
app.use(compression());

// ======================================================
// CORS
// ======================================================

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
console.log = () => {};
console.info = () => {};
console.warn = () => {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/users", require("./routes/user.routes"));
app.use("/api/protected", require("./routes/protectedRoutes"));
app.use("/api/ride-requests", require("./routes/rideRequest.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/drivers", require("./routes/driver.routes"));
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});
app.use((err, req, res, next) => {
  console.error("=================================");
  console.error("[ERROR]");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("=================================");

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});
module.exports = app;
