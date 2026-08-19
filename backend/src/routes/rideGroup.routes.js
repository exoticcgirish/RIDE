const express = require("express");

const router = express.Router();

const {
  getAvailable,
  getMine,
  accept,
  getAccepted,
} = require("../controllers/rideGroup.controller.js");

const authMiddleware = require("../middleware/authMiddleware.js");

router.get(
  "/available",
  authMiddleware,
  getAvailable
);

router.get(
  "/mine",
  authMiddleware,
  getMine
);

router.get(
  "/accepted",
  authMiddleware,
  getAccepted
);

router.patch(
  "/:groupId/accept",
  authMiddleware,
  accept
);

module.exports = router;