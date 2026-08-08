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

// ======================================================
// BODY PARSERS
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================================
// API ROUTES
// ======================================================

// Authentication
app.use("/api/auth", require("./routes/authRoutes"));

// Users
app.use("/api/users", require("./routes/user.routes"));

// Protected routes
app.use("/api/protected", require("./routes/protectedRoutes"));

// Ride requests
app.use("/api/ride-requests", require("./routes/rideRequest.routes"));

// Admin
app.use("/api/admin", require("./routes/admin.routes"));

// Drivers
app.use("/api/drivers", require("./routes/driver.routes"));

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

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

// ======================================================
// EXPORT APP
// ======================================================

module.exports = app;
