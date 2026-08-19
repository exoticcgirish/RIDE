import api from "./api";

export const getAvailableGroups = () => {
  return api.get("/ride-groups/available");
};

export const acceptGroup = (groupId) => {
  return api.post(`/ride-groups/${groupId}/accept`);
};

export const getMyAcceptedGroups = () => {
  return api.get("/ride-groups/accepted");
};

export const getMyRideGroup = () => {
  return api.get("/ride-groups/mine");
};