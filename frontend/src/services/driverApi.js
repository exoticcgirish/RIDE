import api from "./api";

/*
|--------------------------------------------------------------------------
| Driver Profile
|--------------------------------------------------------------------------
*/

export const getDriverProfile = () => {
  return api.get("/drivers/profile");
};

export const updateDriverProfile = (data) => {
  return api.put("/drivers/profile", data);
};

/*
|--------------------------------------------------------------------------
| Approval Status
|--------------------------------------------------------------------------
*/

export const getDriverStatus = () => {
  return api.get("/drivers/status");
};