const Rider = require("../models/Rider");

const getProfile = async (userId) => {
  const rider = await Rider.findById(userId).select("-password");

  if (!rider) {
    throw new Error("Rider not found");
  }

  return rider;
};

const updateProfile = async (userId, data) => {
  const rider = await Rider.findByIdAndUpdate(
    userId,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password");

  if (!rider) {
    throw new Error("Rider not found");
  }

  return rider;
};

module.exports = {
  getProfile,
  updateProfile,
};
