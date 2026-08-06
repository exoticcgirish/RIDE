const {
  createRideRequest,
  getMyRideRequests,
  getRideRequestById,
  updateRideRequest,
  cancelRideRequest,
  deleteRideRequest,
  searchRideRequests,
  assignDriver,
} = require("../services/rideRequest.service.js");

const {
  createRideRequestSchema,
  updateRideRequestSchema,
} = require("../validators/rideRequest.validator.js");

/**
 * Create Ride Request
 */
exports.create = async (req, res) => {
  try {
    console.log("[rideRequest] create called by:", req.user && req.user.id);
    console.log("[rideRequest] payload:", req.body);

    const { error } = createRideRequestSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const rideRequest = await createRideRequest(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Ride request created successfully.",
      data: rideRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get My Ride Requests
 */
exports.getMine = async (req, res) => {
  try {
    const requests = await getMyRideRequests(req.user.id);

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Get Single Ride Request
 */
exports.getById = async (req, res) => {
  try {
    const rideRequest = await getRideRequestById(req.params.id);

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rideRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Update Ride Request
 */
exports.update = async (req, res) => {
  try {
    const { error } = updateRideRequestSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const rideRequest = await updateRideRequest(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Ride request updated successfully.",
      data: rideRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Cancel Ride Request
 */
exports.cancel = async (req, res) => {
  try {
    const rideRequest = await cancelRideRequest(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Ride request cancelled successfully.",
      data: rideRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Delete Ride Request
 */
exports.remove = async (req, res) => {
  try {
    await deleteRideRequest(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Ride request deleted successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Driver Search Ride Requests
 */
exports.search = async (req, res) => {
  try {
    const { pickupLocation, destination, departureDate } = req.query;

    const requests = await searchRideRequests(
      pickupLocation,
      destination,
      departureDate,
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Driver Accept Ride Request
 */
exports.accept = async (req, res) => {
  try {
    const { driverId, tripId } = req.body;

    const rideRequest = await assignDriver(req.params.id, driverId, tripId);

    return res.status(200).json({
      success: true,
      message: "Driver assigned successfully.",
      data: rideRequest,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
