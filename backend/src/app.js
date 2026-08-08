const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

app.use(helmet());
app.use(compression());

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy violation: ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Mount CORS middleware globally (handles both normal requests and OPTIONS preflights)
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/protected", require("./routes/protectedRoutes"));
app.use("/api/ride-requests", require("./routes/rideRequest.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/drivers", require("./routes/driver.routes"));

// 404 Handler (using Express 5 compatible route pattern)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS policy violation")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
