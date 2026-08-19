import api from "./api";


export const createRideRequest = (data) => {
  return api.post(
    "/ride-requests",
    data
  );
};


export const getMyRideRequests = () => {
  return api.get(
    "/ride-requests/my"
  );
};


export const getRideRequestById = (
  id
) => {
  return api.get(
    `/ride-requests/${id}`
  );
};


export const updateRideRequest = (
  id,
  data
) => {
  return api.put(
    `/ride-requests/${id}`,
    data
  );
};


export const cancelRideRequest = (
  id
) => {
  return api.patch(
    `/ride-requests/${id}/cancel`
  );
};


export const deleteRideRequest = (
  id
) => {
  return api.delete(
    `/ride-requests/${id}`
  );
};


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


export const acceptRideRequest = (
  id,
  data
) => {
  return api.patch(
    `/ride-requests/${id}/accept`,
    data
  );
};