const express = require("express");

const {
  create,
  getMine,
  getById,
  update,
  cancel,
  remove,
  search,
  accept,
  getDriverLocation,
} = require("../controllers/rideRequest.controller.js");

const authMiddleware = require("../middleware/authMiddleware.js");
const roleMiddleware = require("../middleware/roleMiddleware.js");

const router = express.Router();

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("rider"),
  getMine,
);

router.get(
  "/search/list",
  authMiddleware,
  roleMiddleware("driver"),
  search,
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("rider"),
  create,
);

router.get(
  "/:rideRequestId/driver-location",
  authMiddleware,
  getDriverLocation,
);

router.get(
  "/:id",
  authMiddleware,
  getById,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("rider"),
  update,
);

router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware("rider"),
  cancel,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("rider"),
  remove,
);

router.patch(
  "/:id/accept",
  authMiddleware,
  roleMiddleware("driver"),
  accept,
);

module.exports = router;