const RideRequest = require("../models/RideRequest.js");
const dbFallback = require("../dbFallback.js");

const createRideRequest = async (riderId, data) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.createRideRequest(riderId, data);
  }

  const rideRequest = await RideRequest.create({
    rider: riderId,
    pickupLocation: data.pickupLocation,
    destination: data.destination,
    pickupCoordinates: data.pickupCoordinates,
    destinationCoordinates: data.destinationCoordinates,
    departureDate: data.departureDate,
    departureTime: data.departureTime,
    seatsRequired: data.seatsRequired || 1,
    notes: data.notes || "",
  });

  return rideRequest;
};

const getMyRideRequests = async (riderId) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestsByRider(riderId);
  }

  return await RideRequest.find({ rider: riderId })
    .populate("assignedDriver", "full_name phone")
    .sort({ createdAt: -1 });
};

/**
 * Get Ride Request By Id
 */
const getRideRequestById = async (id) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestById(id);
  }

  return await RideRequest.findById(id)
    .populate("rider")
    .populate("assignedDriver")
    .populate("trip");
};

/**
 * Update Ride Request
 */
const updateRideRequest = async (id, data) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.updateRideRequest(id, data);
  }

  return await RideRequest.findByIdAndUpdate(
    id,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

/**
 * Cancel Ride Request
 */
const cancelRideRequest = async (id) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.cancelRideRequest(id);
  }

  return await RideRequest.findByIdAndUpdate(
    id,
    {
      status: "cancelled",
    },
    {
      new: true,
    },
  );
};

/**
 * Delete Ride Request
 */
const deleteRideRequest = async (id) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.deleteRideRequest(id);
  }

  return await RideRequest.findByIdAndDelete(id);
};

/**
 * Driver Search Ride Requests
 */
const searchRideRequests = async (
  pickupLocation,
  destination,
  departureDate,
) => {
  const query = {
    status: "waiting",
  };

  if (pickupLocation) {
    query.pickupLocation = {
      $regex: pickupLocation,
      $options: "i",
    };
  }

  if (destination) {
    query.destination = {
      $regex: destination,
      $options: "i",
    };
  }

  if (departureDate) {
    query.departureDate = new Date(departureDate);
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.searchRideRequests({
      pickupLocation,
      destination,
      departureDate,
    });
  }

  return await RideRequest.find(query)
    .populate("rider", "full_name phone")
    .sort({ departureDate: 1, departureTime: 1 });
};

/**
 * Assign Driver
 */
const assignDriver = async (rideRequestId, driverId, tripId) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.assignDriver(rideRequestId, driverId, tripId);
  }

  return await RideRequest.findByIdAndUpdate(
    rideRequestId,
    {
      assignedDriver: driverId,
      trip: tripId,
      status: "accepted",
    },
    {
      new: true,
    },
  );
};

module.exports = {
  createRideRequest,
  getMyRideRequests,
  getRideRequestById,
  updateRideRequest,
  cancelRideRequest,
  deleteRideRequest,
  searchRideRequests,
  assignDriver,
};
