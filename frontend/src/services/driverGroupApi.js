import API from "./api";

export const getAvailableGroups = async () => {
  return await API.get("/driver-groups/available");
};

export const getCurrentGroup = async () => {
  return await API.get("/driver-groups/current");
};

export const acceptGroup = async (groupId) => {
  return await API.post(`/driver-groups/${groupId}/accept`);
};