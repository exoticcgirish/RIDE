const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const allowedRoles = require("../middleware/roleMiddleware");

router.get("/dashboard", auth, (req, res) => {
  res.json({ message: `Hello ${req.user.role}`, role: req.user.role });
});

router.get("/dashboard/rider", auth, allowedRoles(["rider"]), (req, res) => {
  res.json({ message: "Welcome rider dashboard" });
});

router.get("/dashboard/driver", auth, allowedRoles(["driver"]), (req, res) => {
  res.json({ message: "Welcome driver dashboard" });
});

router.get("/dashboard/admin", auth, allowedRoles(["admin"]), (req, res) => {
  res.json({ message: "Welcome admin dashboard" });
});

module.exports = router;
