const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getProfile,
  updateProfile,
  getApprovalStatus,
} = require("../controllers/driver.controller");

/*
|--------------------------------------------------------------------------
| Driver Profile
|--------------------------------------------------------------------------
*/

router.get("/profile", authMiddleware, roleMiddleware("driver"), getProfile);

router.put("/profile", authMiddleware, roleMiddleware("driver"), updateProfile);

/*
|--------------------------------------------------------------------------
| Driver Status
|--------------------------------------------------------------------------
*/

router.get(
  "/status",
  authMiddleware,
  roleMiddleware("driver"),
  getApprovalStatus,
);

module.exports = router;
