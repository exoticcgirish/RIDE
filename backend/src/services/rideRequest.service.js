const RideRequest = require("../models/RideRequest.js");
const dbFallback = require("../dbFallback.js");

const { findOrCreateGroup } = require("./rideGroup.service.js");

const { sendMessage } = require("../rabbitmq/producer.js");

const createRideRequest = async (riderId, data) => {
  // Fallback mode
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

  console.log("Saved Ride:", rideRequest._id.toString());
  const group = await findOrCreateGroup(rideRequest);

  console.log("Ride added to group:", group._id.toString());
  try {
    await sendMessage("group_created", {
      groupId: group._id.toString(),

      rideRequestId: rideRequest._id.toString(),

      riderId: riderId.toString(),

      pickupLocation: group.pickupLocation,

      destination: group.destination,

      departureDate: group.departureDate,

      departureTime: group.departureTime,

      totalSeats: group.totalSeats,

      maxSeats: group.maxSeats,

      status: group.status,
    });

    console.log("RabbitMQ group event sent.");
  } catch (rabbitError) {
    console.error("RabbitMQ group event failed:", rabbitError.message);
  }
  return {
    rideRequest,
    group,
  };
};
const getMyRideRequests = async (riderId) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestsByRider(riderId);
  }

  return await RideRequest.find({ rider: riderId })
    .populate(
      "assignedDriver",
      "full_name phone email vehicleType vehicleNumber vehicleModel vehicleColor",
    )
    .sort({ createdAt: -1 });
};
const getRideRequestById = async (id) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestById(id);
  }
  return await RideRequest.findById(id)
    .populate("rider", "name full_name email phone college")
    .populate("assignedDriver", "name full_name phone")
    .populate("trip")
    .populate("groupId");
};
const updateRideRequest = async (id, data, riderId = null) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.updateRideRequest(id, data);
  }

  const query = {
    _id: id,
  };

  if (riderId) {
    query.rider = riderId;
  }

  return await RideRequest.findOneAndUpdate(
    query,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

const cancelRideRequest = async (id, riderId = null) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.cancelRideRequest(id);
  }

  const query = {
    _id: id,
  };

  if (riderId) {
    query.rider = riderId;
  }

  return await RideRequest.findOneAndUpdate(
    query,
    {
      status: "cancelled",
    },
    {
      new: true,
    },
  );
};

const deleteRideRequest = async (id, riderId = null) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.deleteRideRequest(id);
  }

  const query = {
    _id: id,
  };

  if (riderId) {
    query.rider = riderId;
  }

  return await RideRequest.findOneAndDelete(query);
};

const searchRideRequests = async (
  pickupLocation,
  destination,
  departureDate,
) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.searchRideRequests({
      pickupLocation,
      destination,
      departureDate,
    });
  }

  const query = {
    status: "ready",
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
    const startOfDay = new Date(departureDate);

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(departureDate);

    endOfDay.setHours(23, 59, 59, 999);

    query.departureDate = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  return await RideRequest.find(query)
    .populate("rider", "name full_name phone")
    .populate("groupId")
    .sort({
      departureDate: 1,
      departureTime: 1,
    });
};

const assignDriver = async (rideRequestId, driverId, tripId = null) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.assignDriver(rideRequestId, driverId, tripId);
  }

  const rideRequest = await RideRequest.findByIdAndUpdate(
    rideRequestId,
    {
      assignedDriver: driverId,

      ...(tripId && {
        trip: tripId,
      }),

      status: "accepted",
    },
    {
      new: true,
    },
  );

  return rideRequest;
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

  acceptRideRequest: assignDriver,
};
