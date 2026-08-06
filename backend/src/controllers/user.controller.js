const userService = require("../services/user.service");

exports.getProfile = async (req, res) => {
  try {
    const rider = await userService.getProfile(req.user.id);

    res.json({
      success: true,
      rider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const rider = await userService.updateProfile(req.user.id, req.body);

    res.json({
      success: true,
      rider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
