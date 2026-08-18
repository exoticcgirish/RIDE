const RideGroup = require("../models/RideGroup.js");

exports.getAvailableGroups = async (req, res) => {
  try {
    const groups = await RideGroup.find({
      status: "ready",
      assignedDriver: null,
    })
      .populate({
        path: "members.rider",
        select: "name full_name email phone college",
      })
      .populate({
        path: "members.rideRequest",
        select:
          "pickupLocation destination departureDate departureTime seatsRequired",
      })
      .sort({
        departureDate: 1,
        departureTime: 1,
      });

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
    const { groupId } = req.params;

    const driverId = req.user.id;

    const group = await RideGroup.findOneAndUpdate(
      {
        _id: groupId,
        status: "ready",
        assignedDriver: null,
      },
      {
        assignedDriver: driverId,
        status: "assigned",
      },
      {
        new: true,
      }
    )
      .populate({
        path: "members.rider",
        select: "name full_name email phone college",
      })
      .populate({
        path: "members.rideRequest",
        select:
          "pickupLocation destination departureDate departureTime seatsRequired",
      });

    if (!group) {
      return res.status(409).json({
        success: false,
        message:
          "Group is no longer available.",
      });
    }

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

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyGroup = async (req, res) => {
  try {
    const driverId = req.user.id;

    const group = await RideGroup.findOne({
      assignedDriver: driverId,
      status: "assigned",
    })
      .populate({
        path: "members.rider",
        select:
          "name full_name email phone college",
      })
      .populate({
        path: "members.rideRequest",
        select:
          "pickupLocation destination departureDate departureTime seatsRequired",
      });

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error(
      "Get current group error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};