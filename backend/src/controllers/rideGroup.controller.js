const {
  getAvailableGroups,
  getGroupForRider,
  acceptGroup,
  getAcceptedGroupsForDriver,
} = require("../services/rideGroup.service.js");

// ============================================================
// GET AVAILABLE GROUPS FOR DRIVER
// ============================================================

exports.getAvailable = async (
  req,
  res
) => {
  try {
    const groups =
      await getAvailableGroups(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error(
      "Get available groups error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET RIDER GROUP
// ============================================================

exports.getMine = async (
  req,
  res
) => {
  try {
    const group =
      await getGroupForRider(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error(
      "Get rider group error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// ACCEPT GROUP
// ============================================================

exports.accept = async (
  req,
  res
) => {
  try {
    const group =
      await acceptGroup(
        req.params.groupId,
        req.user.id
      );

    return res.status(200).json({
      success: true,

      message:
        "Ride group accepted successfully.",

      data: group,
    });
  } catch (error) {
    console.error(
      "Accept group error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET ACCEPTED GROUPS
// ============================================================

exports.getAccepted = async (
  req,
  res
) => {
  try {
    const groups =
      await getAcceptedGroupsForDriver(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error(
      "Get accepted groups error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};