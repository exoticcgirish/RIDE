const userService = require("../services/user.service");
const User = require("../modules/user/user.model");

exports.getProfile = async (req, res) => {
  try {
    const rider = await userService.getProfile(req.user.id);

    return res.json({
      success: true,
      user: rider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, college, gender, emergencyContact, profileImage } =
      req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          fullName,
          phone,
          college,
          gender,
          emergencyContact,
          profileImage,
        },
      },
      {
        new: true, // Return updated document
        runValidators: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
