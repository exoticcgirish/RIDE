const driverService = require("../services/driver.service");
const rideGroupService = require("../services/rideGroup.service");
const RideRequest = require("../models/RideRequest");

// =========================================================
// DRIVER PROFILE
// =========================================================

exports.getProfile = async (req, res) => {
  try {
    const driver = await driverService.getProfile(req.user.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (err) {
    console.error("Get driver profile error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const driver = await driverService.updateProfile(
      req.user.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: driver,
    });
  } catch (err) {
    console.error("Update driver profile error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { rideRequestId, latitude, longitude } = req.body;

    if (
      !rideRequestId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "rideRequestId, latitude and longitude are required",
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

// =========================================================
// AVAILABLE RIDE GROUPS
// =========================================================

exports.getAvailableGroups = async (req, res) => {
  try {
    const driverId = req.user.id;

    const groups = await rideGroupService.getAvailableGroups(
      driverId,
    );

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error("Get available groups error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// ACCEPT RIDE GROUP
// =========================================================

exports.acceptGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const driverId = req.user.id;

    const group = await rideGroupService.acceptGroup(
      groupId,
      driverId,
    );

    return res.status(200).json({
      success: true,
      message: "Ride group accepted successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Accept group error:", error);

    const statusCode =
      error.message?.includes("already have an active ride")
        ? 409
        : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// MY ACCEPTED / ACTIVE GROUPS
// =========================================================

exports.getAcceptedGroups = async (req, res) => {
  try {
    const driverId = req.user.id;

    const groups =
      await rideGroupService.getAcceptedGroupsForDriver(
        driverId,
      );

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error(
      "Get accepted groups error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// START RIDE USING OTP
// =========================================================

exports.verifyRideOtp = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { otp } = req.body;

    const driverId = req.user.id;

    const group = await rideGroupService.verifyRideOtp(
      groupId,
      driverId,
      otp,
    );

    return res.status(200).json({
      success: true,
      message: "Ride started successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Verify ride OTP error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// COMPLETE RIDE
// =========================================================

exports.completeRide = async (req, res) => {
  try {
    const { groupId } = req.params;

    const driverId = req.user.id;

    const group = await rideGroupService.completeRide(
      groupId,
      driverId,
    );

    return res.status(200).json({
      success: true,
      message:
        "Ride completed successfully. You are now available for new rides.",
      data: group,
    });
  } catch (error) {
    console.error("Complete ride error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// DRIVER APPROVAL STATUS
// =========================================================

exports.getApprovalStatus = async (req, res) => {
  try {
    const status = await driverService.getApprovalStatus(
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (err) {
    console.error("Get approval status error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};