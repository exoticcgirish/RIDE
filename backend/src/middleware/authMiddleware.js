const jwt = require("jsonwebtoken");
const dbFallback = require("../dbFallback");

module.exports = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    if (dbFallback.isEnabled()) {
      console.log("[auth] dbFallback enabled — attaching dev user to request");
      req.user = { id: "__dev_rider__", role: "rider" };
      return next();
    }

    return res.status(401).json({
      message: "Access denied",
    });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET,
    );

    req.user = decoded;
    next();
  } catch (error) {
    console.log("[auth] token verify error:", error && error.message);
    res.status(401).json({
      message: "Invalid token",
    });
  }
};
