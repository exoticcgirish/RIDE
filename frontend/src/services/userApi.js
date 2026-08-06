import API from "./api";

export const getProfile = () => API.get("/users/profile");

export const updateProfile = (data) => API.put("/users/profile", data);
