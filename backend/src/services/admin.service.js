const Driver = require("../models/Driver");

const getPendingDrivers = async () => {
  return await Driver.find({
    approvalStatus: "pending",
  }).sort({
    createdAt: -1,
  });
};

const getApprovedDrivers = async () => {
  return await Driver.find({
    approvalStatus: "approved",
  }).sort({
    createdAt: -1,
  });
};

const getRejectedDrivers = async () => {
  return await Driver.find({
    approvalStatus: "rejected",
  }).sort({
    createdAt: -1,
  });
};

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
