const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware.js");

const {
  getAvailableGroups,
  acceptGroup,
  getGroupForRider,
} = require("../controllers/rideGroup.controller.js");

router.get(
  "/available",
  authMiddleware,
  getAvailableGroups
);

router.post(
  "/:id/accept",
  authMiddleware,
  acceptGroup
);

router.get(
  "/my-group",
  authMiddleware,
  getGroupForRider
);

module.exports = router;