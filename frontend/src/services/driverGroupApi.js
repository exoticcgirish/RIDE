import API from "./api";

export const getAvailableGroups = async () => {
  return await API.get("/ride-groups/available");
};

export const getCurrentGroup = async () => {
  return await API.get("/ride-groups/mine");
};

export const acceptGroup = async (groupId) => {
  return await API.patch(`/ride-groups/${groupId}/accept`);
};