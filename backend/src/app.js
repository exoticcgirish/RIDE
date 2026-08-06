const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/protected", require("./routes/protectedRoutes"));
app.use("/api/ride-requests", require("./routes/rideRequest.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/drivers", require("./routes/driver.routes"));

module.exports = app;
