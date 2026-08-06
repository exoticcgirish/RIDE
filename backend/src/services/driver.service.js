const Driver = require("../models/Driver");

/*
|--------------------------------------------------------------------------
| Get Driver Profile
|--------------------------------------------------------------------------
*/

const getProfile = async (driverId) => {
  return await Driver.findById(driverId).select("-password");
};

/*
|--------------------------------------------------------------------------
| Update Driver Profile
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Upload Driving License
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Approval Status
|--------------------------------------------------------------------------
*/

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
