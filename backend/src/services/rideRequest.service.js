const RideRequest = require("../models/RideRequest.js");
const dbFallback = require("../dbFallback.js");

const { findOrCreateGroup } = require("./rideGroup.service.js");
const { sendMessage } = require("../rabbitmq/producer.js");

const DRIVER_FIELDS =
  "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor";

/*
|--------------------------------------------------------------------------
| CREATE RIDE REQUEST
|--------------------------------------------------------------------------
*/

const createRideRequest = async (riderId, data) => {
  if (!riderId) {
    throw new Error("Rider ID is required");
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.createRideRequest(riderId, data);
  }

  const pickupLocation = String(data.pickupLocation || "").trim();

  const destination = String(data.destination || "").trim();

  const pickupELoc = String(data.pickupELoc || "").trim() || null;

  const destinationELoc = String(data.destinationELoc || "").trim() || null;

  const pickupPlaceName = String(data.pickupPlaceName || "").trim() || null;

  const pickupPlaceAddress =
    String(data.pickupPlaceAddress || "").trim() || null;

  const destinationPlaceName =
    String(data.destinationPlaceName || "").trim() || null;

  const destinationPlaceAddress =
    String(data.destinationPlaceAddress || "").trim() || null;

  const departureDate = data.departureDate;

  const departureTime = String(data.departureTime || "").trim();

  const seatsRequired = Number(data.seatsRequired) || 1;

  if (!pickupLocation) {
    throw new Error("pickupLocation is required");
  }

  if (!pickupELoc) {
    throw new Error(
      "pickupELoc is required. Please select the pickup location from Mappls.",
    );
  }

  if (!destination) {
    throw new Error("destination is required");
  }

  if (!destinationELoc) {
    throw new Error(
      "destinationELoc is required. Please select the destination from Mappls.",
    );
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

  const rideRequestData = {
    rider: riderId,

    pickupLocation,
    pickupELoc,
    pickupPlaceName,
    pickupPlaceAddress,

    destination,
    destinationELoc,
    destinationPlaceName,
    destinationPlaceAddress,

    departureDate,
    departureTime,

    seatsRequired,

    notes: String(data.notes || "").trim(),

    groupId: null,

    status: "waiting",

    assignedDriver: null,

    trip: null,
  };

  const rideRequest = await RideRequest.create(rideRequestData);

  /*
  |--------------------------------------------------------------------------
  | RABBITMQ - RIDE CREATED
  |--------------------------------------------------------------------------
  */

  try {
    await sendMessage("ride_created", {
      event: "ride_created",

      rideRequestId: rideRequest._id.toString(),

      riderId: riderId.toString(),

      pickupLocation: rideRequest.pickupLocation,

      pickupELoc: rideRequest.pickupELoc,

      pickupPlaceName: rideRequest.pickupPlaceName,

      pickupPlaceAddress: rideRequest.pickupPlaceAddress,

      destination: rideRequest.destination,

      destinationELoc: rideRequest.destinationELoc,

      destinationPlaceName: rideRequest.destinationPlaceName,

      destinationPlaceAddress: rideRequest.destinationPlaceAddress,

      departureDate: rideRequest.departureDate,

      departureTime: rideRequest.departureTime,

      seatsRequired: rideRequest.seatsRequired,

      status: rideRequest.status,

      createdAt: rideRequest.createdAt,
    });
  } catch (rabbitError) {
    console.error("RabbitMQ ride_created event failed:", rabbitError.message);
  }

  /*
  |--------------------------------------------------------------------------
  | FIND OR CREATE RIDE GROUP
  |--------------------------------------------------------------------------
  */

  let group = null;

  try {
    group = await findOrCreateGroup(rideRequest._id);
  } catch (error) {
    console.error("Ride grouping error:", error);

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | RABBITMQ - GROUP CREATED
  |--------------------------------------------------------------------------
  |
  | NOTE:
  | findOrCreateGroup() already publishes group_created.
  |
  | Therefore we DO NOT publish group_created again here.
  |
  */

  /*
  |--------------------------------------------------------------------------
  | GET UPDATED RIDE REQUEST
  |--------------------------------------------------------------------------
  */

  const updatedRideRequest = await RideRequest.findById(rideRequest._id)
    .populate({
      path: "rider",
      select: "full_name name email phone college",
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
    });

  return {
    rideRequest: updatedRideRequest,
    group,
  };
};

/*
|--------------------------------------------------------------------------
| GET MY RIDE REQUESTS
|--------------------------------------------------------------------------
*/

const getMyRideRequests = async (riderId) => {
  if (!riderId) {
    throw new Error("Rider ID is required");
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestsByRider(riderId);
  }

  return RideRequest.find({
    rider: riderId,
  })
    .populate({
      path: "rider",
      select: "full_name name email phone college",
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

/*
|--------------------------------------------------------------------------
| GET RIDE REQUEST BY ID
|--------------------------------------------------------------------------
*/

const getRideRequestById = async (id) => {
  if (!id) {
    throw new Error("Ride request ID is required");
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.getRideRequestById(id);
  }

  return RideRequest.findById(id)
    .populate({
      path: "rider",
      select: "full_name name email phone college",
    })
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

/*
|--------------------------------------------------------------------------
| UPDATE RIDE REQUEST
|--------------------------------------------------------------------------
*/

const updateRideRequest = async (id, data, riderId = null) => {
  if (!id) {
    throw new Error("Ride request ID is required");
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.updateRideRequest(id, data);
  }

  const query = {
    _id: id,
  };

  if (riderId) {
    query.rider = riderId;
  }

  const updateData = {
    ...data,
  };

  if (data.pickupLocation !== undefined) {
    const pickupLocation = String(data.pickupLocation || "").trim();

    if (!pickupLocation) {
      throw new Error("pickupLocation cannot be empty");
    }

    updateData.pickupLocation = pickupLocation;
  }

  if (data.pickupELoc !== undefined) {
    const pickupELoc = String(data.pickupELoc || "").trim();

    if (!pickupELoc) {
      throw new Error("pickupELoc is required when updating pickup location");
    }

    updateData.pickupELoc = pickupELoc;
  }

  if (data.destination !== undefined) {
    const destination = String(data.destination || "").trim();

    if (!destination) {
      throw new Error("destination cannot be empty");
    }

    updateData.destination = destination;
  }

  if (data.destinationELoc !== undefined) {
    const destinationELoc = String(data.destinationELoc || "").trim();

    if (!destinationELoc) {
      throw new Error("destinationELoc is required when updating destination");
    }

    updateData.destinationELoc = destinationELoc;
  }

  if (data.pickupPlaceName !== undefined) {
    updateData.pickupPlaceName =
      String(data.pickupPlaceName || "").trim() || null;
  }

  if (data.pickupPlaceAddress !== undefined) {
    updateData.pickupPlaceAddress =
      String(data.pickupPlaceAddress || "").trim() || null;
  }

  if (data.destinationPlaceName !== undefined) {
    updateData.destinationPlaceName =
      String(data.destinationPlaceName || "").trim() || null;
  }

  if (data.destinationPlaceAddress !== undefined) {
    updateData.destinationPlaceAddress =
      String(data.destinationPlaceAddress || "").trim() || null;
  }

  if (data.departureTime !== undefined) {
    const departureTime = String(data.departureTime || "").trim();

    if (!departureTime) {
      throw new Error("departureTime cannot be empty");
    }

    updateData.departureTime = departureTime;
  }

  if (data.departureDate !== undefined) {
    if (!data.departureDate) {
      throw new Error("departureDate cannot be empty");
    }

    updateData.departureDate = data.departureDate;
  }

  if (data.seatsRequired !== undefined) {
    const seatsRequired = Number(data.seatsRequired);

    if (
      !Number.isInteger(seatsRequired) ||
      seatsRequired < 1 ||
      seatsRequired > 4
    ) {
      throw new Error("Seats required must be between 1 and 4");
    }

    updateData.seatsRequired = seatsRequired;
  }

  if (data.notes !== undefined) {
    updateData.notes = String(data.notes || "").trim();
  }

  return RideRequest.findOneAndUpdate(
    query,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({
      path: "rider",
      select: "full_name name email phone college",
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
    });
};

/*
|--------------------------------------------------------------------------
| CANCEL RIDE REQUEST
|--------------------------------------------------------------------------
*/

const cancelRideRequest = async (id, riderId = null) => {
  if (!id) {
    throw new Error("Ride request ID is required");
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.cancelRideRequest(id);
  }

  const query = {
    _id: id,
  };

  if (riderId) {
    query.rider = riderId;
  }

  return RideRequest.findOneAndUpdate(
    query,
    {
      $set: {
        status: "cancelled",
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

/*
|--------------------------------------------------------------------------
| DELETE RIDE REQUEST
|--------------------------------------------------------------------------
*/

const deleteRideRequest = async (id, riderId = null) => {
  if (!id) {
    throw new Error("Ride request ID is required");
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.deleteRideRequest(id);
  }

  const query = {
    _id: id,
  };

  if (riderId) {
    query.rider = riderId;
  }

  return RideRequest.findOneAndDelete(query);
};

/*
|--------------------------------------------------------------------------
| SEARCH RIDE REQUESTS
|--------------------------------------------------------------------------
*/

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
    status: {
      $in: ["waiting", "grouped"],
    },
  };

  if (pickupLocation) {
    query.pickupLocation = {
      $regex: String(pickupLocation),
      $options: "i",
    };
  }

  if (destination) {
    query.destination = {
      $regex: String(destination),
      $options: "i",
    };
  }

  if (departureDate) {
    const startOfDay = new Date(departureDate);

    if (Number.isNaN(startOfDay.getTime())) {
      throw new Error("Invalid departure date");
    }

    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(departureDate);

    endOfDay.setHours(23, 59, 59, 999);

    query.departureDate = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  return RideRequest.find(query)
    .populate({
      path: "rider",
      select: "name full_name phone email college",
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
      departureDate: 1,
      departureTime: 1,
    });
};

/*
|--------------------------------------------------------------------------
| ASSIGN DRIVER
|--------------------------------------------------------------------------
*/

const assignDriver = async (rideRequestId, driverId, tripId = null) => {
  if (!rideRequestId) {
    throw new Error("Ride request ID is required");
  }

  if (!driverId) {
    throw new Error("Driver ID is required");
  }

  if (dbFallback.isEnabled()) {
    return dbFallback.assignDriver(rideRequestId, driverId, tripId);
  }

  const rideRequest = await RideRequest.findByIdAndUpdate(
    rideRequestId,
    {
      $set: {
        assignedDriver: driverId,

        status: "accepted",

        ...(tripId && {
          trip: tripId,
        }),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate({
      path: "rider",
      select: "full_name name email phone college",
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
    });

  if (!rideRequest) {
    throw new Error("Ride request not found");
  }

  return rideRequest;
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

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
