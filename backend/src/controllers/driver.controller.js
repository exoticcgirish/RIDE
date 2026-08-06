const driverService = require("../services/driver.service");

/*
|--------------------------------------------------------------------------
| Driver Profile
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Approval Status
|--------------------------------------------------------------------------
*/

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
