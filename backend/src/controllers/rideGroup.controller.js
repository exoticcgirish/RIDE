const {
  getAvailableGroups: getAvailableGroupsService,
  acceptGroup: acceptGroupService,
  getGroupForRider: getGroupForRiderService,
} = require("../services/rideGroup.service");
exports.getGroupForRider = async (req, res) => {
  try {
    const riderId = req.user.id;

    const group = await getGroupForRiderService(riderId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "No ride group found",
      });
    }

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Get rider group error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getAvailableGroups = async (req, res) => {
  try {
    const groups = await getAvailableGroupsService();

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


exports.acceptGroup = async (req, res) => {
  try {
    const driverId = req.user.id;
    const groupId = req.params.id;

    const group = await acceptGroupService(
      groupId,
      driverId
    );

    return res.status(200).json({
      success: true,
      message: "Ride group accepted successfully",
      data: group,
    });
  } catch (error) {
    console.error("Accept group error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};