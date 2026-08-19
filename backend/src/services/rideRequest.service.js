const RideRequest = require("../models/RideRequest.js");
const dbFallback = require("../dbFallback.js");

const { findOrCreateGroup } = require("./rideGroup.service.js");

const { sendMessage } = require("../rabbitmq/producer.js");

const DRIVER_FIELDS =
  "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor";

const createRideRequest = async (riderId, data) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.createRideRequest(riderId, data);
  }

  const pickupLocation = String(data.pickupLocation || "").trim();

  const destination = String(data.destination || "").trim();

  const departureDate = data.departureDate;

  const departureTime = String(data.departureTime || "").trim();

  const seatsRequired = Number(data.seatsRequired) || 1;

  if (!pickupLocation) {
    throw new Error("pickupLocation is required");
  }

  if (!destination) {
    throw new Error("destination is required");
  }

  if (!departureDate) {
    throw new Error("departureDate is required");
  }

  if (!departureTime) {
    throw new Error("departureTime is required");
  }

  if (seatsRequired < 1 || seatsRequired > 4) {
    throw new Error("Seats required must be between 1 and 4");
  }

  const rideRequest = await RideRequest.create({
    rider: riderId,

    pickupLocation,

    destination,

    pickupCoordinates: data.pickupCoordinates || null,

    destinationCoordinates: data.destinationCoordinates || null,

    departureDate,

    departureTime,

    seatsRequired,

    notes: data.notes || "",

    status: "waiting",

    assignedDriver: null,

    trip: null,

    groupId: null,
  });

  console.log("Ride request created:", rideRequest._id.toString());

  let group = null;

  try {
    group = await findOrCreateGroup(rideRequest._id);
  } catch (error) {
    console.error("Grouping error:", error.message);

    throw error;
  }

  if (group) {
    console.log("Ride group created:", group._id.toString());

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
  } else {
    console.log("No group created. Waiting for compatible riders.");
  }

  const updatedRideRequest = await RideRequest.findById(rideRequest._id)
    .populate({
      path: "assignedDriver",
      select: DRIVER_FIELDS,
    })
    .populate({
      path: "groupId",
      populate: {
        path: "assignedDriver",
        select: DRIVER_FIELDS,
      },
    });

  return {
    rideRequest: updatedRideRequest,

    group,
  };
};

const getMyRideRequests = async (riderId) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestsByRider(riderId);
  }

  return await RideRequest.find({
    rider: riderId,
  })
    .populate({
      path: "assignedDriver",
      select: DRIVER_FIELDS,
    })
    .populate({
      path: "groupId",
      populate: {
        path: "assignedDriver",
        select: DRIVER_FIELDS,
      },
    })
    .sort({
      createdAt: -1,
    });
};

const getRideRequestById = async (id) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestById(id);
  }

  return await RideRequest.findById(id)
    .populate("rider", "name full_name email phone college")
    .populate({
      path: "assignedDriver",
      select: DRIVER_FIELDS,
    })
    .populate("trip")
    .populate({
      path: "groupId",
      populate: {
        path: "assignedDriver",
        select: DRIVER_FIELDS,
      },
    });
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
  )
    .populate({
      path: "assignedDriver",
      select: DRIVER_FIELDS,
    })
    .populate({
      path: "groupId",
      populate: {
        path: "assignedDriver",
        select: DRIVER_FIELDS,
      },
    });
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
      $set: {
        status: "cancelled",
      },
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
    .populate({
      path: "assignedDriver",
      select: DRIVER_FIELDS,
    })
    .populate({
      path: "groupId",
      populate: {
        path: "assignedDriver",
        select: DRIVER_FIELDS,
      },
    })
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
  )
    .populate({
      path: "assignedDriver",
      select: DRIVER_FIELDS,
    })
    .populate({
      path: "groupId",
      populate: {
        path: "assignedDriver",
        select: DRIVER_FIELDS,
      },
    });

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
