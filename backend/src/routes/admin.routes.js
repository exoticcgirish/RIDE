const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  dashboard,
  getPendingDrivers,
  getApprovedDrivers,
  getRejectedDrivers,
  approveDriver,
  rejectDriver,
} = require("../controllers/admin.controller");

router.get("/dashboard", authMiddleware, roleMiddleware("admin"), dashboard);


router.get(
  "/drivers/pending",
  authMiddleware,
  roleMiddleware("admin"),
  getPendingDrivers,
);

router.get(
  "/drivers/approved",
  authMiddleware,
  roleMiddleware("admin"),
  getApprovedDrivers,
);

router.get(
  "/drivers/rejected",
  authMiddleware,
  roleMiddleware("admin"),
  getRejectedDrivers,
);


router.patch(
  "/drivers/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  approveDriver,
);

router.patch(
  "/drivers/:id/reject",
  authMiddleware,
  roleMiddleware("admin"),
  rejectDriver,
);

module.exports = router;
