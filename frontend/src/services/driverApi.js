import API from "./api";

export const getDriverProfile = () => {
  return API.get("/drivers/profile");
};

export const updateDriverProfile = (data) => {
  return API.put("/drivers/profile", data);
};

export const getDriverStatus = () => {
  return API.get("/drivers/status");
};

export const getAvailableRideGroups = () => {
  return API.get("/ride-groups/available");
};

export const getCurrentGroup = () => {
  return API.get("/ride-groups/current");
};

export const getAcceptedRideGroups = () => {
  return API.get("/ride-groups/accepted");
};

export const acceptRideGroup = (groupId) => {
  return API.patch(`/ride-groups/${groupId}/accept`);
};
export const updateDriverLocation = (rideRequestId, latitude, longitude) => {
  return API.put("/drivers/location", {
    rideRequestId,
    latitude,
    longitude,
  });
};