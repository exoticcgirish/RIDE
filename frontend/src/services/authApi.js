import API from "./api";

export const login = (data) => API.post("/auth/login", data);

export const register = (data) => API.post("/auth/register", data);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
export const updateProfile = (profileData) => {
  const token = localStorage.getItem("token");

  return axios.put("/api/profile", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const registerDriver = (data) => {
  return api.post("/auth/register/driver", data);
};
