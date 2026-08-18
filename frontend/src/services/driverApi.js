import API from "./api";

// ========================================
// DRIVER PROFILE
// ========================================

export const getDriverProfile = () => {
  return API.get("/drivers/profile");
};

export const updateDriverProfile = (data) => {
  return API.put("/drivers/profile", data);
};

// ========================================
// DRIVER STATUS
// ========================================

export const getDriverStatus = () => {
  return API.get("/drivers/status");
};

// ========================================
// AVAILABLE RIDE GROUPS
// ========================================

export const getAvailableRideGroups = () => {
  return API.get("/ride-groups/available");
};

// ========================================
// CURRENT RIDE GROUP
// ========================================

export const getCurrentGroup = () => {
  return API.get("/ride-groups/current");
};

// ========================================
// ACCEPT RIDE GROUP
// ========================================

export const acceptRideGroup = (groupId) => {
  return API.patch(`/ride-groups/${groupId}/accept`);
};
