import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7001/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getMyRideGroup = () => {
  return API.get("/ride-groups/my-group");
};