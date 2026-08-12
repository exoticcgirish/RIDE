const Driver = require("../models/Driver");

const getProfile = async (driverId) => {
  return await Driver.findById(driverId).select("-password");
};

const updateProfile = async (driverId, data) => {
  return await Driver.findByIdAndUpdate(
    driverId,
    {
      $set: {
        full_name: data.full_name,
        phone: data.phone,
        vehicleName: data.vehicleName,
        vehicleNumber: data.vehicleNumber,
        vehicleColor: data.vehicleColor,
        totalSeats: data.totalSeats,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password");
};


const updateLicense = async (driverId, licenseUrl) => {
  return await Driver.findByIdAndUpdate(
    driverId,
    {
      drivingLicense: licenseUrl,
    },
    {
      new: true,
    },
  );
};


const getApprovalStatus = async (driverId) => {
  return await Driver.findById(driverId).select(
    "approvalStatus approvedAt rejectReason",
  );
};

module.exports = {
  getProfile,
  updateProfile,
  updateLicense,
  getApprovalStatus,
};
