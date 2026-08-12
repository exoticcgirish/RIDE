import api from "./api";
export const getDashboardStats = () => {
  return api.get("/admin/dashboard");
};
export const getPendingDrivers = () => {
  return api.get("/admin/drivers/pending");
};
export const getApprovedDrivers = () => {
  return api.get("/admin/drivers/approved");
};
export const getRejectedDrivers = () => {
  return api.get("/admin/drivers/rejected");
};
export const approveDriver = (driverId) => {
  return api.patch(`/admin/drivers/${driverId}/approve`);
};
export const rejectDriver = (driverId, reason) => {
  return api.patch(`/admin/drivers/${driverId}/reject`, {
    reason,
  });
};
