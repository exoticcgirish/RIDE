const adminService = require("../services/admin.service");

exports.dashboard = async (req, res) => {
  try {
    const data = await adminService.dashboardCounts();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getPendingDrivers = async (req, res) => {
  try {
    const drivers = await adminService.getPendingDrivers();

    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getApprovedDrivers = async (req, res) => {
  try {
    const drivers = await adminService.getApprovedDrivers();

    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getRejectedDrivers = async (req, res) => {
  try {
    const drivers = await adminService.getRejectedDrivers();

    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.approveDriver = async (req, res) => {
  try {
    const driver = await adminService.approveDriver(req.params.id, req.user.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver approved successfully.",
      data: driver,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.rejectDriver = async (req, res) => {
  try {
    const { reason } = req.body;

    const driver = await adminService.rejectDriver(req.params.id, reason);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver rejected successfully.",
      data: driver,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
