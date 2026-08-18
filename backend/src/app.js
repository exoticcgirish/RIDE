const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const { sendMessage } = require("./rabbitmq/producer.js");

const app = express();

app.use(helmet());
app.use(compression());

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  credentials: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// AUTH
app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

// USERS
app.use(
  "/api/users",
  require("./routes/user.routes")
);

// PROTECTED
app.use(
  "/api/protected",
  require("./routes/protectedRoutes")
);

// RIDE REQUESTS
app.use(
  "/api/ride-requests",
  require("./routes/rideRequest.routes")
);

// ADMIN
app.use(
  "/api/admin",
  require("./routes/admin.routes")
);

// DRIVERS
app.use(
  "/api/drivers",
  require("./routes/driver.routes")
);

// ⭐ RIDE GROUPS
app.use(
  "/api/ride-groups",
  require("./routes/rideGroup.routes.js")
);

// RABBITMQ TEST
app.get("/test-rabbit", async (req, res) => {
  try {
    await sendMessage("ride_created", {
      rideId: "TEST123",
      userId: "USER123",
      pickup: "Greater Noida",
      destination: "Delhi",
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Message sent to RabbitMQ",
    });
  } catch (error) {
    console.error(
      "[RabbitMQ Test Error]",
      error
    );

    res.status(500).json({
      success: false,
      message: "RabbitMQ test failed",
      error: error.message,
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("=================================");
  console.error("[ERROR]");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("=================================");

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      err.message || "Internal Server Error",

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

module.exports = app;