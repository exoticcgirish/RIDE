const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getProfile,
  updateProfile,
  getApprovalStatus,
  updateDriverLocation,
} = require("../controllers/driver.controller");

const {
  getAvailable,
  accept,
  getAccepted,
} = require("../controllers/rideGroup.controller");

router.get("/profile", authMiddleware, roleMiddleware("driver"), getProfile);

router.put("/profile", authMiddleware, roleMiddleware("driver"), updateProfile);

router.get(
  "/status",
  authMiddleware,
  roleMiddleware("driver"),
  getApprovalStatus,
);
router.put(
  "/location",
  authMiddleware,
  roleMiddleware("driver"),
  updateDriverLocation,
);

router.get(
  "/ride-groups",
  authMiddleware,
  roleMiddleware("driver"),
  getAvailable,
);

router.post(
  "/ride-groups/:groupId/accept",
  authMiddleware,
  roleMiddleware("driver"),
  accept,
);

router.get(
  "/ride-groups/accepted",
  authMiddleware,
  roleMiddleware("driver"),
  getAccepted,
);

module.exports = router;
