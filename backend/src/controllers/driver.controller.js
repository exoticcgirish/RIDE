const driverService = require("../services/driver.service");
const RideRequest = require("../models/RideRequest");

exports.getProfile = async (req, res) => {
  try {
    const driver = await driverService.getProfile(req.user.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const driver = await driverService.updateProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: driver,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { rideRequestId, latitude, longitude } = req.body;

    if (!rideRequestId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "rideRequestId, latitude and longitude are required",
      });
    }

    const rideRequest = await RideRequest.findById(rideRequestId);

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found",
      });
    }

    if (
      rideRequest.assignedDriver &&
      rideRequest.assignedDriver.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this ride",
      });
    }

    rideRequest.driverLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      updatedAt: new Date(),
    };

    await rideRequest.save();

    return res.status(200).json({
      success: true,
      message: "Driver location updated",
      driverLocation: rideRequest.driverLocation,
    });
  } catch (error) {
    console.error("Update driver location error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update driver location",
    });
  }
};

exports.getApprovalStatus = async (req, res) => {
  try {
    const status = await driverService.getApprovalStatus(req.user.id);

    res.json({
      success: true,
      data: status,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
