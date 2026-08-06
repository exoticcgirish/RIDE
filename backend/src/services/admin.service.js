const Driver = require("../models/Driver");

/*
|--------------------------------------------------------------------------
| Get Pending Drivers
|--------------------------------------------------------------------------
*/
const getPendingDrivers = async () => {
  return await Driver.find({
    approvalStatus: "pending",
  }).sort({
    createdAt: -1,
  });
};

/*
|--------------------------------------------------------------------------
| Get Approved Drivers
|--------------------------------------------------------------------------
*/
const getApprovedDrivers = async () => {
  return await Driver.find({
    approvalStatus: "approved",
  }).sort({
    createdAt: -1,
  });
};

/*
|--------------------------------------------------------------------------
| Get Rejected Drivers
|--------------------------------------------------------------------------
*/
const getRejectedDrivers = async () => {
  return await Driver.find({
    approvalStatus: "rejected",
  }).sort({
    createdAt: -1,
  });
};

/*
|--------------------------------------------------------------------------
| Approve Driver
|--------------------------------------------------------------------------
*/
const approveDriver = async (driverId, adminId) => {
  return await Driver.findByIdAndUpdate(
    driverId,
    {
      approvalStatus: "approved",
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectReason: "",
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

/*
|--------------------------------------------------------------------------
| Reject Driver
|--------------------------------------------------------------------------
*/
const rejectDriver = async (driverId, reason) => {
  return await Driver.findByIdAndUpdate(
    driverId,
    {
      approvalStatus: "rejected",
      rejectReason: reason || "",
      approvedBy: null,
      approvedAt: null,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

/*
|--------------------------------------------------------------------------
| Dashboard Counts
|--------------------------------------------------------------------------
*/
const dashboardCounts = async () => {
  const pending = await Driver.countDocuments({
    approvalStatus: "pending",
  });

  const approved = await Driver.countDocuments({
    approvalStatus: "approved",
  });

  const rejected = await Driver.countDocuments({
    approvalStatus: "rejected",
  });

  const total = await Driver.countDocuments();

  return {
    total,
    pending,
    approved,
    rejected,
  };
};

module.exports = {
  getPendingDrivers,
  getApprovedDrivers,
  getRejectedDrivers,
  approveDriver,
  rejectDriver,
  dashboardCounts,
};
