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
| Rider Routes
|--------------------------------------------------------------------------
*/

// Create Ride Request
router.post("/", authMiddleware, roleMiddleware("rider"), create);

// Get My Ride Requests
router.get("/my", authMiddleware, roleMiddleware("rider"), getMine);

// Get Single Ride Request
router.get("/:id", authMiddleware, getById);

// Update Ride Request
router.put("/:id", authMiddleware, roleMiddleware("rider"), update);

// Cancel Ride Request
router.patch("/:id/cancel", authMiddleware, roleMiddleware("rider"), cancel);

// Delete Ride Request
router.delete("/:id", authMiddleware, roleMiddleware("rider"), remove);

/*
|--------------------------------------------------------------------------
| Driver Routes
|--------------------------------------------------------------------------
*/

// Search Waiting Ride Requests
router.get("/search/list", authMiddleware, roleMiddleware("driver"), search);

// Driver Accept Ride Request
router.patch("/:id/accept", authMiddleware, roleMiddleware("driver"), accept);

module.exports = router;
