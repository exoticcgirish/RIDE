import api from "./api";

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export const getDashboardStats = () => {
  return api.get("/admin/dashboard");
};

/*
|--------------------------------------------------------------------------
| Driver Lists
|--------------------------------------------------------------------------
*/

export const getPendingDrivers = () => {
  return api.get("/admin/drivers/pending");
};

export const getApprovedDrivers = () => {
  return api.get("/admin/drivers/approved");
};

export const getRejectedDrivers = () => {
  return api.get("/admin/drivers/rejected");
};

/*
|--------------------------------------------------------------------------
| Driver Approval
|--------------------------------------------------------------------------
*/

export const approveDriver = (driverId) => {
  return api.patch(`/admin/drivers/${driverId}/approve`);
};

export const rejectDriver = (driverId, reason) => {
  return api.patch(`/admin/drivers/${driverId}/reject`, {
    reason,
  });
};
