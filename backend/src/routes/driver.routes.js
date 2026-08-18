const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getProfile,
  updateProfile,
  getApprovalStatus,
} = require("../controllers/driver.controller");

const {
  getAvailableGroups,
  acceptGroup,
} = require("../controllers/rideGroup.controller");

// ========================================
// DRIVER PROFILE
// ========================================

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("driver"),
  getProfile
);

router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("driver"),
  updateProfile
);

// ========================================
// DRIVER APPROVAL STATUS
// ========================================

router.get(
  "/status",
  authMiddleware,
  roleMiddleware("driver"),
  getApprovalStatus
);

// ========================================
// AVAILABLE RIDE GROUPS
// ========================================

router.get(
  "/ride-groups",
  authMiddleware,
  roleMiddleware("driver"),
  getAvailableGroups
);

// ========================================
// ACCEPT RIDE GROUP
// ========================================

router.post(
  "/ride-groups/:id/accept",
  authMiddleware,
  roleMiddleware("driver"),
  acceptGroup
);

module.exports = router;