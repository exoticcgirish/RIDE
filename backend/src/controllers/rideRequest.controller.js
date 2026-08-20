const RideRequest = require("../models/RideRequest.js");

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

    const result = await createRideRequest(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Ride request created successfully.",
      data: result,
    });
  } catch (err) {
    console.error("Create ride error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getDriverLocation = async (req, res) => {
  try {
    const { rideRequestId } = req.params;

    const rideRequest = await RideRequest.findById(rideRequestId).select(
      "driverLocation assignedDriver",
    );

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found",
      });
    }

    if (!rideRequest.assignedDriver) {
      return res.status(404).json({
        success: false,
        message: "No driver assigned to this ride",
      });
    }

    if (
      !rideRequest.driverLocation ||
      rideRequest.driverLocation.latitude === null ||
      rideRequest.driverLocation.longitude === null
    ) {
      return res.status(404).json({
        success: false,
        message: "Driver location not available",
      });
    }

    return res.status(200).json({
      success: true,
      driverLocation: rideRequest.driverLocation,
    });
  } catch (error) {
    console.error("Get driver location error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get driver location",
    });
  }
};

exports.getMine = async (req, res) => {
  try {
    console.log("Logged User:", req.user);

    const requests = await getMyRideRequests(req.user.id);

    console.log("Ride Requests:", requests);

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    console.error("Get Ride Requests Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

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

exports.update = async (req, res) => {
  try {
    const { error } = updateRideRequestSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const rideRequest = await updateRideRequest(
      req.params.id,
      req.body,
      req.user.id,
    );

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

exports.cancel = async (req, res) => {
  try {
    const rideRequest = await cancelRideRequest(req.params.id, req.user.id);

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

exports.remove = async (req, res) => {
  try {
    await deleteRideRequest(req.params.id, req.user.id);

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

exports.accept = async (req, res) => {
  try {
    const { driverId, tripId } = req.body;

    const rideRequest = await assignDriver(req.params.id, driverId, tripId);

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver assigned successfully.",
      data: rideRequest,
    });
  } catch (err) {
    console.error("Accept ride error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
