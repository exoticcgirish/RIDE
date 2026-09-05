const {
  getAvailableGroups,
  getGroupForRider,
  acceptGroup,
  getAcceptedGroupsForDriver,
  verifyRideOtp,
  completeRide,
} = require("../services/rideGroup.service.js");

exports.getAvailable = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 10, 1),
      50,
    );

    const result = await getAvailableGroups(req.user.id, page, limit);

    return res.status(200).json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get available groups error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get available ride groups.",
    });
  }
};

exports.getMine = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const group = await getGroupForRider(req.user.id);

    return res.status(200).json({
      success: true,
      data: group || null,
    });
  } catch (error) {
    console.error("Get rider group error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get rider group.",
    });
  }
};

exports.accept = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required.",
      });
    }

    const group = await acceptGroup(groupId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Ride group accepted successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Accept group error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to accept ride group.",
    });
  }
};

exports.getAccepted = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const groups = await getAcceptedGroupsForDriver(req.user.id);

    const safeGroups = Array.isArray(groups) ? groups : [];

    return res.status(200).json({
      success: true,
      count: safeGroups.length,
      data: safeGroups,
    });
  } catch (error) {
    console.error("Get accepted groups error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get accepted ride groups.",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { groupId } = req.params;
    const { otp } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required.",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    const group = await verifyRideOtp(groupId, req.user.id, otp);

    return res.status(200).json({
      success: true,
      message: "OTP verified. Ride started successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Verify ride OTP error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to verify ride OTP.",
    });
  }
};

exports.complete = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required.",
      });
    }

    const group = await completeRide(groupId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Ride completed successfully.",
      data: group,
    });
  } catch (error) {
    console.error("Complete ride error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to complete ride.",
    });
  }
};
