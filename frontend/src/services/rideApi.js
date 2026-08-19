import api from "./api";

// ==========================================
// CREATE RIDE
// ==========================================

export const createRideRequest = (data) => {
  return api.post(
    "/ride-requests",
    data
  );
};

// ==========================================
// MY RIDES
// ==========================================

export const getMyRideRequests = () => {
  return api.get(
    "/ride-requests/my"
  );
};

// ==========================================
// SINGLE RIDE
// ==========================================

export const getRideRequestById = (
  id
) => {
  return api.get(
    `/ride-requests/${id}`
  );
};

// ==========================================
// UPDATE
// ==========================================

export const updateRideRequest = (
  id,
  data
) => {
  return api.put(
    `/ride-requests/${id}`,
    data
  );
};

// ==========================================
// CANCEL
// ==========================================

export const cancelRideRequest = (
  id
) => {
  return api.patch(
    `/ride-requests/${id}/cancel`
  );
};

// ==========================================
// DELETE
// ==========================================

export const deleteRideRequest = (
  id
) => {
  return api.delete(
    `/ride-requests/${id}`
  );
};

// ==========================================
// SEARCH
// ==========================================

export const searchRideRequests = (
  params
) => {
  return api.get(
    "/ride-requests/search/list",
    {
      params,
    }
  );
};

// ==========================================
// ACCEPT SINGLE RIDE
// ==========================================

export const acceptRideRequest = (
  id,
  data
) => {
  return api.patch(
    `/ride-requests/${id}/accept`,
    data
  );
};