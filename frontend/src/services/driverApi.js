import API from "./api";

/*
|--------------------------------------------------------------------------
| DRIVER PROFILE
|--------------------------------------------------------------------------
*/

export const getDriverProfile = () => {
  return API.get("/drivers/profile");
};

export const updateDriverProfile = (data) => {
  return API.put("/drivers/profile", data);
};

/*
|--------------------------------------------------------------------------
| DRIVER STATUS
|--------------------------------------------------------------------------
*/

export const getDriverStatus = () => {
  return API.get("/drivers/status");
};

/*
|--------------------------------------------------------------------------
| RIDE GROUPS
|--------------------------------------------------------------------------
*/

/*
 * Available ride groups with pagination.
 *
 * Example:
 * getAvailableRideGroups(1, 10)
 *
 * Request:
 * GET /ride-groups/available?page=1&limit=10
 */
export const getAvailableRideGroups = (page = 1, limit = 10) => {
  return API.get("/ride-groups/available", {
    params: {
      page,
      limit,
    },
  });
};

/*
 * Accepted groups.
 */
export const getAcceptedRideGroups = () => {
  return API.get("/ride-groups/accepted");
};

/*
 * Current rider group.
 */
export const getCurrentGroup = () => {
  return API.get("/ride-groups/mine");
};

/*
 * Accept ride group.
 */
export const acceptRideGroup = (groupId) => {
  return API.patch(`/ride-groups/${groupId}/accept`);
};

/*
|--------------------------------------------------------------------------
| RIDE LIFECYCLE
|--------------------------------------------------------------------------
|
| accepted
|    ↓
| verify OTP
|    ↓
| in_progress
|    ↓
| completed
|
|--------------------------------------------------------------------------
*/

export const verifyRideOtp = (groupId, otp) => {
  return API.patch(`/ride-groups/${groupId}/verify-otp`, {
    otp,
  });
};

export const completeRide = (groupId) => {
  return API.patch(`/ride-groups/${groupId}/complete`);
};

/*
|--------------------------------------------------------------------------
| DRIVER LOCATION
|--------------------------------------------------------------------------
*/

export const updateDriverLocation = (rideRequestId, latitude, longitude) => {
  return API.put("/drivers/location", {
    rideRequestId,
    latitude,
    longitude,
  });
};
