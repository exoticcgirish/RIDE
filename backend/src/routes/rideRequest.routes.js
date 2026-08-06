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
} = require("../controllers/rideRequest.controller.js");

const authMiddleware = require("../middleware/authMiddleware.js");
const roleMiddleware = require("../middleware/roleMiddleware.js");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Static & Specific Routes (Must come BEFORE dynamic /:id routes)
|--------------------------------------------------------------------------
*/

// Get My Ride Requests (Rider)
router.get("/my", authMiddleware, roleMiddleware("rider"), getMine);

// Search Waiting Ride Requests (Driver)
router.get("/search/list", authMiddleware, roleMiddleware("driver"), search);

// Create Ride Request (Rider)
router.post("/", authMiddleware, roleMiddleware("rider"), create);

/*
|--------------------------------------------------------------------------
| Dynamic Param Routes (/:id)
|--------------------------------------------------------------------------
*/

// Get Single Ride Request
router.get("/:id", authMiddleware, getById);

// Update Ride Request (Rider)
router.put("/:id", authMiddleware, roleMiddleware("rider"), update);

// Cancel Ride Request (Rider)
router.patch("/:id/cancel", authMiddleware, roleMiddleware("rider"), cancel);

// Delete Ride Request (Rider)
router.delete("/:id", authMiddleware, roleMiddleware("rider"), remove);

// Driver Accept Ride Request (Driver)
router.patch("/:id/accept", authMiddleware, roleMiddleware("driver"), accept);

module.exports = router;
