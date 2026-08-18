import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080",

  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

export const getAvailableGroups =
  async () => {
    return await API.get(
      "/api/driver-groups/available"
    );
  };

export const getCurrentGroup =
  async () => {
    return await API.get(
      "/api/driver-groups/current"
    );
  };

export const acceptGroup =
  async (groupId) => {
    return await API.post(
      `/api/driver-groups/${groupId}/accept`
    );
  };