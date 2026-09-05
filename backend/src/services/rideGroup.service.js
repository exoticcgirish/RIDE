const RideGroup = require("../models/RideGroup.js");
const RideRequest = require("../models/RideRequest.js");

const { sendMessage } = require("../rabbitmq/producer.js");

const MAX_SEATS = 4;

const DRIVER_FIELDS =
  "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor";

const RIDER_FIELDS = "full_name name email phone college";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalize = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ");
};

const normalizeELoc = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase();
};

/*
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
| This handles both:
|
| assignedDriver = ObjectId
|
| assignedDriver = populated driver object
|
| So RabbitMQ always receives only the driver ID.
|--------------------------------------------------------------------------
*/

const getIdString = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) {
    return false;
  }

  const first = new Date(date1);
  const second = new Date(date2);

  if (Number.isNaN(first.getTime()) || Number.isNaN(second.getTime())) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const isSameTime = (time1, time2) => {
  return String(time1 || "").trim() === String(time2 || "").trim();
};

const locationMatches = ({
  currentELoc,
  currentLocation,
  candidateELoc,
  candidateLocation,
}) => {
  const normalizedCurrentELoc = normalizeELoc(currentELoc);
  const normalizedCandidateELoc = normalizeELoc(candidateELoc);

  /*
  |--------------------------------------------------------------------------
  | Prefer Mappls ELoc
  |--------------------------------------------------------------------------
  */

  if (
    normalizedCurrentELoc &&
    normalizedCandidateELoc &&
    normalizedCurrentELoc === normalizedCandidateELoc
  ) {
    return {
      matches: true,
      reason: "same-eloc",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Fallback to normalized location text
  |--------------------------------------------------------------------------
  */

  const normalizedCurrentLocation = normalize(currentLocation);
  const normalizedCandidateLocation = normalize(candidateLocation);

  if (
    normalizedCurrentLocation &&
    normalizedCandidateLocation &&
    normalizedCurrentLocation === normalizedCandidateLocation
  ) {
    return {
      matches: true,
      reason: "same-location-name",
    };
  }

  return {
    matches: false,
    reason: "not-compatible",
  };
};

const makePoint = (coordinates) => {
  if (
    !coordinates ||
    !Number.isFinite(Number(coordinates.latitude)) ||
    !Number.isFinite(Number(coordinates.longitude))
  ) {
    return null;
  }

  return {
    type: "Point",
    coordinates: [Number(coordinates.longitude), Number(coordinates.latitude)],
  };
};

const populateGroup = (query) => {
  return query
    .populate({
      path: "assignedDriver",
      select: DRIVER_FIELDS,
    })
    .populate({
      path: "members",
      populate: {
        path: "rider",
        select: RIDER_FIELDS,
      },
    });
};

const generateRideOtp = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

/*
|--------------------------------------------------------------------------
| FIND EXACT SEAT COMBINATION
|--------------------------------------------------------------------------
*/

const findExactSeatCombination = (requests, targetSeats) => {
  const result = [];

  const findCombination = (index, total) => {
    if (total === targetSeats) {
      return true;
    }

    if (total > targetSeats) {
      return false;
    }

    for (let i = index; i < requests.length; i++) {
      const seats = Number(requests[i].seatsRequired) || 1;

      if (findCombination(i + 1, total + seats)) {
        result.push(requests[i]);
        return true;
      }
    }

    return false;
  };

  const found = findCombination(0, 0);

  if (!found) {
    return null;
  }

  return result.reverse();
};

/*
|--------------------------------------------------------------------------
| RABBITMQ - GROUP CREATED
|--------------------------------------------------------------------------
*/

const publishGroupCreated = async (group) => {
  if (!group) {
    return;
  }

  try {
    await sendMessage("group_created", {
      event: "group_created",

      groupId: getIdString(group._id),

      memberIds: Array.isArray(group.members)
        ? group.members.map((member) => getIdString(member))
        : [],

      pickupLocation: group.pickupLocation || null,

      pickupELoc: group.pickupELoc || null,

      destination: group.destination || null,

      destinationELoc: group.destinationELoc || null,

      departureDate: group.departureDate || null,

      departureTime: group.departureTime || null,

      totalSeats: group.totalSeats || 0,

      maxSeats: group.maxSeats || MAX_SEATS,

      status: group.status || "ready",
    });

    console.log(`📤 group_created event published → ${getIdString(group._id)}`);
  } catch (error) {
    console.error("❌ RabbitMQ group_created event failed:", error.message);
  }
};

/*
|--------------------------------------------------------------------------
| RABBITMQ - GROUP ACCEPTED
|--------------------------------------------------------------------------
*/

const publishGroupAccepted = async (group) => {
  if (!group) {
    return;
  }

  try {
    const driverId = getIdString(group.assignedDriver);

    await sendMessage("group_accepted", {
      event: "group_accepted",

      groupId: getIdString(group._id),

      /*
      |--------------------------------------------------------------------------
      | FIX:
      | If assignedDriver is populated, getIdString()
      | extracts assignedDriver._id.
      |--------------------------------------------------------------------------
      */

      driverId,

      memberIds: Array.isArray(group.members)
        ? group.members.map((member) => getIdString(member))
        : [],

      status: group.status || "accepted",
    });

    console.log(
      `📤 group_accepted event published → group=${getIdString(
        group._id,
      )}, driver=${driverId}`,
    );
  } catch (error) {
    console.error("❌ RabbitMQ group_accepted event failed:", error.message);
  }
};

/*
|--------------------------------------------------------------------------
| RABBITMQ - RIDE STARTED
|--------------------------------------------------------------------------
*/

const publishRideStarted = async (group) => {
  if (!group) {
    return;
  }

  try {
    const driverId = getIdString(group.assignedDriver);

    await sendMessage("ride_started", {
      event: "ride_started",

      groupId: getIdString(group._id),

      driverId,

      memberIds: Array.isArray(group.members)
        ? group.members.map((member) => getIdString(member))
        : [],

      rideStartedAt: group.rideStartedAt || null,

      status: group.status || "in_progress",
    });

    console.log(
      `📤 ride_started event published → group=${getIdString(
        group._id,
      )}, driver=${driverId}`,
    );
  } catch (error) {
    console.error("❌ RabbitMQ ride_started event failed:", error.message);
  }
};

/*
|--------------------------------------------------------------------------
| RABBITMQ - RIDE COMPLETED
|--------------------------------------------------------------------------
*/

const publishRideCompleted = async (group) => {
  if (!group) {
    return;
  }

  try {
    const driverId = getIdString(group.assignedDriver);

    await sendMessage("ride_completed", {
      event: "ride_completed",

      groupId: getIdString(group._id),

      driverId,

      memberIds: Array.isArray(group.members)
        ? group.members.map((member) => getIdString(member))
        : [],

      rideCompletedAt: group.rideCompletedAt || null,

      status: group.status || "completed",
    });

    console.log(
      `📤 ride_completed event published → group=${getIdString(
        group._id,
      )}, driver=${driverId}`,
    );
  } catch (error) {
    console.error("❌ RabbitMQ ride_completed event failed:", error.message);
  }
};

/*
|--------------------------------------------------------------------------
| FIND OR CREATE GROUP
|--------------------------------------------------------------------------
*/

const findOrCreateGroup = async (rideRequestInput) => {
  let rideRequest;

  if (
    rideRequestInput &&
    typeof rideRequestInput === "object" &&
    rideRequestInput._id
  ) {
    rideRequest = await RideRequest.findById(rideRequestInput._id);
  } else {
    rideRequest = await RideRequest.findById(rideRequestInput);
  }

  if (!rideRequest) {
    throw new Error("Ride request not found.");
  }

  /*
  |--------------------------------------------------------------------------
  | Already belongs to a group
  |--------------------------------------------------------------------------
  */

  if (rideRequest.groupId) {
    return populateGroup(RideGroup.findById(rideRequest.groupId));
  }

  const pickupLocation = String(rideRequest.pickupLocation || "").trim();

  const destination = String(rideRequest.destination || "").trim();

  const pickupELoc = String(rideRequest.pickupELoc || "").trim() || null;

  const destinationELoc =
    String(rideRequest.destinationELoc || "").trim() || null;

  const departureDate = rideRequest.departureDate;

  const departureTime = String(rideRequest.departureTime || "").trim();

  const seatsRequired = Number(rideRequest.seatsRequired) || 1;

  if (!pickupLocation) {
    throw new Error("pickupLocation is required.");
  }

  if (!destination) {
    throw new Error("destination is required.");
  }

  if (!departureDate) {
    throw new Error("departureDate is required.");
  }

  if (!departureTime) {
    throw new Error("departureTime is required.");
  }

  if (seatsRequired < 1 || seatsRequired > MAX_SEATS) {
    throw new Error(`Seats required must be between 1 and ${MAX_SEATS}.`);
  }

  /*
  |--------------------------------------------------------------------------
  | DATE RANGE
  |--------------------------------------------------------------------------
  */

  const date = new Date(departureDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid departure date.");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  /*
  |--------------------------------------------------------------------------
  | FIND WAITING REQUESTS
  |--------------------------------------------------------------------------
  */

  const waitingRequests = await RideRequest.find({
    status: "waiting",

    _id: {
      $ne: rideRequest._id,
    },

    $or: [
      {
        groupId: null,
      },
      {
        groupId: {
          $exists: false,
        },
      },
    ],

    departureDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },

    departureTime,
  }).sort({
    createdAt: 1,
  });

  /*
  |--------------------------------------------------------------------------
  | FILTER COMPATIBLE REQUESTS
  |--------------------------------------------------------------------------
  */

  const compatibleRequests = waitingRequests.filter((request) => {
    if (!isSameDate(request.departureDate, departureDate)) {
      return false;
    }

    if (!isSameTime(request.departureTime, departureTime)) {
      return false;
    }

    const pickupMatch = locationMatches({
      currentELoc: pickupELoc,
      currentLocation: pickupLocation,
      candidateELoc: request.pickupELoc,
      candidateLocation: request.pickupLocation,
    });

    if (!pickupMatch.matches) {
      return false;
    }

    const destinationMatch = locationMatches({
      currentELoc: destinationELoc,
      currentLocation: destination,
      candidateELoc: request.destinationELoc,
      candidateLocation: request.destination,
    });

    if (!destinationMatch.matches) {
      return false;
    }

    const seats = Number(request.seatsRequired) || 1;

    if (seats < 1 || seats > MAX_SEATS) {
      return false;
    }

    return true;
  });

  /*
  |--------------------------------------------------------------------------
  | INCLUDE CURRENT REQUEST
  |--------------------------------------------------------------------------
  */

  const allCompatible = [rideRequest, ...compatibleRequests];

  /*
  |--------------------------------------------------------------------------
  | FIND EXACT 4-SEAT GROUP
  |--------------------------------------------------------------------------
  */

  const combination = findExactSeatCombination(allCompatible, MAX_SEATS);

  if (!combination) {
    return null;
  }

  const totalSeats = combination.reduce((total, request) => {
    return total + (Number(request.seatsRequired) || 1);
  }, 0);

  if (totalSeats !== MAX_SEATS) {
    return null;
  }

  const memberIds = combination.map((request) => request._id);

  /*
  |--------------------------------------------------------------------------
  | COORDINATES
  |--------------------------------------------------------------------------
  */

  const pickupCoordinates = rideRequest.pickupCoordinates || null;

  const destinationCoordinates = rideRequest.destinationCoordinates || null;

  /*
  |--------------------------------------------------------------------------
  | GROUP DATA
  |--------------------------------------------------------------------------
  */

  const groupData = {
    members: memberIds,

    pickupLocation,

    pickupELoc,

    destination,

    destinationELoc,

    departureDate,

    departureTime,

    totalSeats: MAX_SEATS,

    maxSeats: MAX_SEATS,

    status: "ready",

    assignedDriver: null,

    rideOtp: null,

    rideStartedAt: null,

    rideCompletedAt: null,
  };

  /*
  |--------------------------------------------------------------------------
  | PICKUP COORDINATES
  |--------------------------------------------------------------------------
  */

  if (
    pickupCoordinates &&
    Number.isFinite(Number(pickupCoordinates.latitude)) &&
    Number.isFinite(Number(pickupCoordinates.longitude))
  ) {
    groupData.pickupCoordinates = {
      latitude: Number(pickupCoordinates.latitude),

      longitude: Number(pickupCoordinates.longitude),
    };

    const pickupPoint = makePoint(pickupCoordinates);

    if (pickupPoint) {
      groupData.pickupPoint = pickupPoint;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DESTINATION COORDINATES
  |--------------------------------------------------------------------------
  */

  if (
    destinationCoordinates &&
    Number.isFinite(Number(destinationCoordinates.latitude)) &&
    Number.isFinite(Number(destinationCoordinates.longitude))
  ) {
    groupData.destinationCoordinates = {
      latitude: Number(destinationCoordinates.latitude),

      longitude: Number(destinationCoordinates.longitude),
    };

    const destinationPoint = makePoint(destinationCoordinates);

    if (destinationPoint) {
      groupData.destinationPoint = destinationPoint;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CREATE GROUP
  |--------------------------------------------------------------------------
  */

  const group = await RideGroup.create(groupData);

  /*
  |--------------------------------------------------------------------------
  | UPDATE MEMBERS
  |--------------------------------------------------------------------------
  */

  await RideRequest.updateMany(
    {
      _id: {
        $in: memberIds,
      },
    },
    {
      $set: {
        groupId: group._id,
        status: "grouped",
      },
    },
  );

  /*
  |--------------------------------------------------------------------------
  | POPULATE GROUP
  |--------------------------------------------------------------------------
  */

  const createdGroup = await populateGroup(RideGroup.findById(group._id));

  /*
  |--------------------------------------------------------------------------
  | RABBITMQ
  |--------------------------------------------------------------------------
  */

  await publishGroupCreated(createdGroup);

  return createdGroup;
};

/*
|--------------------------------------------------------------------------
| GET AVAILABLE GROUPS
|--------------------------------------------------------------------------
*/

const getAvailableGroups = async (driverId, page = 1, limit = 10) => {
  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  page = Math.max(Number.parseInt(page, 10) || 1, 1);

  limit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 50);

  /*
  |--------------------------------------------------------------------------
  | Driver cannot accept multiple active groups
  |--------------------------------------------------------------------------
  */

  const existingActiveGroup = await RideGroup.findOne({
    assignedDriver: driverId,

    status: {
      $in: ["accepted", "in_progress"],
    },
  }).select("_id");

  if (existingActiveGroup) {
    return {
      data: [],

      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: page > 1,
      },
    };
  }

  const filter = {
    status: "ready",

    $or: [
      {
        assignedDriver: null,
      },
      {
        assignedDriver: {
          $exists: false,
        },
      },
    ],
  };

  const total = await RideGroup.countDocuments(filter);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  const safePage = totalPages > 0 ? Math.min(page, totalPages) : page;

  const skip = (safePage - 1) * limit;

  const groups = await populateGroup(
    RideGroup.find(filter)
      .sort({
        departureDate: 1,
        departureTime: 1,
        _id: 1,
      })
      .skip(skip)
      .limit(limit),
  );

  return {
    data: groups,

    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
};

/*
|--------------------------------------------------------------------------
| GET GROUP FOR RIDER
|--------------------------------------------------------------------------
*/

const getGroupForRider = async (riderId) => {
  if (!riderId) {
    throw new Error("Rider ID is required.");
  }

  const rideRequest = await RideRequest.findOne({
    rider: riderId,
  })
    .sort({
      createdAt: -1,
    })
    .select("_id groupId status");

  if (!rideRequest || !rideRequest.groupId) {
    return null;
  }

  return populateGroup(RideGroup.findById(rideRequest.groupId));
};

/*
|--------------------------------------------------------------------------
| ACCEPT GROUP
|--------------------------------------------------------------------------
*/

const acceptGroup = async (groupId, driverId) => {
  if (!groupId) {
    throw new Error("Group ID is required.");
  }

  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  /*
  |--------------------------------------------------------------------------
  | Driver cannot have another active group
  |--------------------------------------------------------------------------
  */

  const existingActiveGroup = await RideGroup.findOne({
    assignedDriver: driverId,

    status: {
      $in: ["accepted", "in_progress"],
    },
  }).select("_id");

  if (existingActiveGroup) {
    throw new Error(
      "You already have an active ride group. Complete the current ride before accepting another group.",
    );
  }

  const rideOtp = generateRideOtp();

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT:
  | returnDocument: "after"
  |
  | This replaces deprecated:
  | new: true
  |--------------------------------------------------------------------------
  */

  const group = await RideGroup.findOneAndUpdate(
    {
      _id: groupId,

      status: "ready",

      $or: [
        {
          assignedDriver: null,
        },
        {
          assignedDriver: {
            $exists: false,
          },
        },
      ],
    },
    {
      $set: {
        assignedDriver: driverId,

        status: "accepted",

        rideOtp,

        rideStartedAt: null,

        rideCompletedAt: null,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!group) {
    throw new Error("Ride group is already accepted or does not exist.");
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE ALL RIDES IN GROUP
  |--------------------------------------------------------------------------
  */

  await RideRequest.updateMany(
    {
      _id: {
        $in: group.members,
      },
    },
    {
      $set: {
        status: "accepted",

        assignedDriver: driverId,

        groupId: group._id,
      },
    },
  );

  /*
  |--------------------------------------------------------------------------
  | POPULATE
  |--------------------------------------------------------------------------
  */

  const acceptedGroup = await populateGroup(RideGroup.findById(group._id));

  /*
  |--------------------------------------------------------------------------
  | RABBITMQ
  |--------------------------------------------------------------------------
  */

  await publishGroupAccepted(acceptedGroup);

  return acceptedGroup;
};

/*
|--------------------------------------------------------------------------
| VERIFY RIDE OTP
|--------------------------------------------------------------------------
*/

const verifyRideOtp = async (groupId, driverId, enteredOtp) => {
  if (!groupId) {
    throw new Error("Group ID is required.");
  }

  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  const otp = String(enteredOtp || "").trim();

  if (!/^\d{4}$/.test(otp)) {
    throw new Error("OTP must be exactly 4 digits.");
  }

  const group = await RideGroup.findOne({
    _id: groupId,

    assignedDriver: driverId,

    status: "accepted",
  });

  if (!group) {
    throw new Error("Accepted ride group not found.");
  }

  if (!group.rideOtp || group.rideOtp !== otp) {
    throw new Error("Incorrect ride OTP.");
  }

  const rideStartedAt = new Date();

  group.status = "in_progress";

  group.rideStartedAt = rideStartedAt;

  await group.save();

  /*
  |--------------------------------------------------------------------------
  | UPDATE RIDES
  |--------------------------------------------------------------------------
  */

  await RideRequest.updateMany(
    {
      _id: {
        $in: group.members,
      },

      assignedDriver: driverId,
    },
    {
      $set: {
        status: "in_progress",

        assignedDriver: driverId,

        groupId: group._id,
      },
    },
  );

  /*
  |--------------------------------------------------------------------------
  | POPULATE
  |--------------------------------------------------------------------------
  */

  const startedGroup = await populateGroup(RideGroup.findById(group._id));

  /*
  |--------------------------------------------------------------------------
  | RABBITMQ
  |--------------------------------------------------------------------------
  */

  await publishRideStarted(startedGroup);

  return startedGroup;
};

/*
|--------------------------------------------------------------------------
| COMPLETE RIDE
|--------------------------------------------------------------------------
*/

const completeRide = async (groupId, driverId) => {
  if (!groupId) {
    throw new Error("Group ID is required.");
  }

  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  const group = await RideGroup.findOne({
    _id: groupId,

    assignedDriver: driverId,

    status: "in_progress",
  });

  if (!group) {
    throw new Error(
      "Ride is not in progress or you are not the assigned driver.",
    );
  }

  const rideCompletedAt = new Date();

  group.status = "completed";

  group.rideCompletedAt = rideCompletedAt;

  await group.save();

  /*
  |--------------------------------------------------------------------------
  | UPDATE RIDES
  |--------------------------------------------------------------------------
  */

  const updateResult = await RideRequest.updateMany(
    {
      _id: {
        $in: group.members,
      },

      assignedDriver: driverId,
    },
    {
      $set: {
        status: "completed",

        assignedDriver: driverId,

        groupId: group._id,
      },
    },
  );

  console.log(`[ride] Group ${group._id} completed by driver ${driverId}.`);

  console.log(
    `[ride] ${updateResult.modifiedCount} RideRequests marked completed.`,
  );

  /*
  |--------------------------------------------------------------------------
  | POPULATE
  |--------------------------------------------------------------------------
  */

  const completedGroup = await populateGroup(RideGroup.findById(group._id));

  /*
  |--------------------------------------------------------------------------
  | RABBITMQ
  |--------------------------------------------------------------------------
  */

  await publishRideCompleted(completedGroup);

  return completedGroup;
};

/*
|--------------------------------------------------------------------------
| GET ACCEPTED GROUPS FOR DRIVER
|--------------------------------------------------------------------------
*/

const getAcceptedGroupsForDriver = async (driverId) => {
  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  return populateGroup(
    RideGroup.find({
      assignedDriver: driverId,

      status: {
        $in: ["accepted", "in_progress"],
      },
    }).sort({
      departureDate: 1,
      departureTime: 1,
    }),
  );
};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  findOrCreateGroup,

  getAvailableGroups,

  getGroupForRider,

  acceptGroup,

  getAcceptedGroupsForDriver,

  verifyRideOtp,

  completeRide,
};
