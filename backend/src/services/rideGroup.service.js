const RideGroup = require("../models/RideGroup.js");
const RideRequest = require("../models/RideRequest.js");

const MAX_SEATS = 4;

/*
|--------------------------------------------------------------------------
| Fields used when populating Driver and Rider information
|--------------------------------------------------------------------------
*/

const DRIVER_FIELDS =
  "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor";

const RIDER_FIELDS = "full_name name email phone college";

/*
|--------------------------------------------------------------------------
| Normalize normal location strings
|--------------------------------------------------------------------------
|
| Used as a fallback when eLoc is not available.
|
|--------------------------------------------------------------------------
*/

const normalize = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ");
};

/*
|--------------------------------------------------------------------------
| Normalize Mappls eLoc
|--------------------------------------------------------------------------
*/

const normalizeELoc = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Compare dates
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Compare departure times
|--------------------------------------------------------------------------
*/

const isSameTime = (time1, time2) => {
  return String(time1 || "").trim() === String(time2 || "").trim();
};

/*
|--------------------------------------------------------------------------
| Check whether two locations match
|--------------------------------------------------------------------------
|
| eLoc is preferred.
| If eLoc is unavailable, location text is compared.
|
|--------------------------------------------------------------------------
*/

const locationMatches = ({
  currentELoc,
  currentLocation,
  candidateELoc,
  candidateLocation,
}) => {
  const normalizedCurrentELoc = normalizeELoc(currentELoc);

  const normalizedCandidateELoc = normalizeELoc(candidateELoc);

  /*
   * First compare Mappls eLoc.
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
   * Fallback to normalized location text.
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

/*
|--------------------------------------------------------------------------
| Convert coordinates to GeoJSON Point
|--------------------------------------------------------------------------
|
| Kept because your existing project may still have optional
| coordinate information.
|
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Populate RideGroup
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Generate Ride OTP
|--------------------------------------------------------------------------
|
| Generates a random 4-digit OTP.
|
| Example:
|
| 4827
|
| The OTP belongs to the entire RideGroup.
|
|--------------------------------------------------------------------------
*/

const generateRideOtp = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

/*
|--------------------------------------------------------------------------
| Find Exact Seat Combination
|--------------------------------------------------------------------------
|
| Example:
|
| Rider A = 2 seats
| Rider B = 1 seat
| Rider C = 1 seat
|
| Total = 4 seats
|
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
| Find Or Create RideGroup
|--------------------------------------------------------------------------
|
| Existing grouping logic.
|
| A group is created only when an exact 4-seat combination
| can be found.
|
|--------------------------------------------------------------------------
*/

const findOrCreateGroup = async (rideRequestInput) => {
  /*
   * -------------------------------------------------------
   * Find current RideRequest
   * -------------------------------------------------------
   */

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
   * -------------------------------------------------------
   * Already grouped
   * -------------------------------------------------------
   */

  if (rideRequest.groupId) {
    return populateGroup(RideGroup.findById(rideRequest.groupId));
  }

  /*
   * -------------------------------------------------------
   * Current request information
   * -------------------------------------------------------
   */

  const pickupLocation = String(rideRequest.pickupLocation || "").trim();

  const destination = String(rideRequest.destination || "").trim();

  const pickupELoc = String(rideRequest.pickupELoc || "").trim() || null;

  const destinationELoc =
    String(rideRequest.destinationELoc || "").trim() || null;

  const departureDate = rideRequest.departureDate;

  const departureTime = String(rideRequest.departureTime || "").trim();

  const seatsRequired = Number(rideRequest.seatsRequired) || 1;

  /*
   * -------------------------------------------------------
   * Validate basic fields
   * -------------------------------------------------------
   */

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
   * -------------------------------------------------------
   * Coordinates are optional.
   * eLoc remains the primary location identifier.
   * -------------------------------------------------------
   */

  console.log("[grouping] Current ride location identifiers:", {
    pickupELoc,
    destinationELoc,
  });

  /*
   * -------------------------------------------------------
   * Date boundaries
   * -------------------------------------------------------
   */

  const date = new Date(departureDate);

  const startOfDay = new Date(date);

  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);

  endOfDay.setHours(23, 59, 59, 999);

  /*
   * -------------------------------------------------------
   * Find waiting requests
   * -------------------------------------------------------
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

  console.log(`[grouping] Found ${waitingRequests.length} waiting candidates.`);

  /*
   * -------------------------------------------------------
   * Find compatible requests
   * -------------------------------------------------------
   */

  const compatibleRequests = waitingRequests.filter((request) => {
    /*
     * Date compatibility
     */

    if (!isSameDate(request.departureDate, departureDate)) {
      return false;
    }

    /*
     * Time compatibility
     */

    if (!isSameTime(request.departureTime, departureTime)) {
      return false;
    }

    /*
     * Pickup compatibility
     */

    const pickupMatch = locationMatches({
      currentELoc: pickupELoc,

      currentLocation: pickupLocation,

      candidateELoc: request.pickupELoc,

      candidateLocation: request.pickupLocation,
    });

    if (!pickupMatch.matches) {
      return false;
    }

    /*
     * Destination compatibility
     */

    const destinationMatch = locationMatches({
      currentELoc: destinationELoc,

      currentLocation: destination,

      candidateELoc: request.destinationELoc,

      candidateLocation: request.destination,
    });

    if (!destinationMatch.matches) {
      return false;
    }

    /*
     * Seat validation
     */

    const seats = Number(request.seatsRequired) || 1;

    if (seats < 1 || seats > MAX_SEATS) {
      return false;
    }

    console.log("[grouping] Compatible ride found:", {
      rideRequestId: request._id.toString(),

      pickupELoc: request.pickupELoc,

      destinationELoc: request.destinationELoc,

      seats,
    });

    return true;
  });

  console.log(
    `[grouping] ${compatibleRequests.length} compatible requests found.`,
  );

  /*
   * -------------------------------------------------------
   * Include current request
   * -------------------------------------------------------
   */

  const allCompatible = [rideRequest, ...compatibleRequests];

  /*
   * -------------------------------------------------------
   * Find exact 4-seat combination
   * -------------------------------------------------------
   */

  const combination = findExactSeatCombination(allCompatible, MAX_SEATS);

  if (!combination) {
    console.log("[grouping] No exact 4-seat combination found.");

    return null;
  }

  /*
   * -------------------------------------------------------
   * Calculate total seats
   * -------------------------------------------------------
   */

  const totalSeats = combination.reduce((total, request) => {
    return total + (Number(request.seatsRequired) || 1);
  }, 0);

  if (totalSeats !== MAX_SEATS) {
    console.log("[grouping] Combination does not contain exactly 4 seats.");

    return null;
  }

  /*
   * -------------------------------------------------------
   * Member IDs
   * -------------------------------------------------------
   */

  const memberIds = combination.map((request) => request._id);

  console.log(
    "[grouping] Creating group with members:",
    memberIds.map((id) => id.toString()),
  );

  /*
   * -------------------------------------------------------
   * Optional coordinates
   * -------------------------------------------------------
   */

  const pickupCoordinates = rideRequest.pickupCoordinates || null;

  const destinationCoordinates = rideRequest.destinationCoordinates || null;

  /*
   * -------------------------------------------------------
   * Build RideGroup
   * -------------------------------------------------------
   *
   * OTP is NOT generated here.
   *
   * OTP is generated when a driver accepts the group.
   *
   * This prevents an OTP from being created for a group
   * that does not yet have a driver.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Preserve pickup coordinates if available
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Preserve destination coordinates if available
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Create RideGroup
   * -------------------------------------------------------
   */

  const group = await RideGroup.create(groupData);

  console.log("[grouping] RideGroup created:", group._id.toString());

  /*
   * -------------------------------------------------------
   * Update RideRequests
   * -------------------------------------------------------
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

  console.log(
    `[grouping] ${memberIds.length} RideRequests assigned to group ${group._id}.`,
  );

  /*
   * -------------------------------------------------------
   * Return populated group
   * -------------------------------------------------------
   */

  return populateGroup(RideGroup.findById(group._id));
};

/*
|--------------------------------------------------------------------------
| Available Groups For Driver
|--------------------------------------------------------------------------
*/

const getAvailableGroups = async (driverId) => {
  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  /*
   * A driver cannot accept another group while an existing
   * ride is still active.
   *
   * Both "accepted" and "in_progress" are active states.
   */

  const existingActiveGroup = await RideGroup.findOne({
    assignedDriver: driverId,

    status: {
      $in: ["accepted", "in_progress"],
    },
  }).select("_id");

  if (existingActiveGroup) {
    return [];
  }

  /*
   * Return groups waiting for a driver.
   */

  return populateGroup(
    RideGroup.find({
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
    }).sort({
      departureDate: 1,
      departureTime: 1,
    }),
  );
};

/*
|--------------------------------------------------------------------------
| Group For Rider
|--------------------------------------------------------------------------
*/

const getGroupForRider = async (riderId) => {
  if (!riderId) {
    throw new Error("Rider ID is required.");
  }

  /*
   * Get the rider's latest ride request.
   */

  const rideRequest = await RideRequest.findOne({
    rider: riderId,
  })
    .sort({
      createdAt: -1,
    })
    .select("_id groupId status");

  if (!rideRequest) {
    return null;
  }

  if (!rideRequest.groupId) {
    return null;
  }

  /*
   * Return the complete populated group.
   */

  return populateGroup(RideGroup.findById(rideRequest.groupId));
};

/*
|--------------------------------------------------------------------------
| Accept Group
|--------------------------------------------------------------------------
|
| When the driver accepts:
|
| ready
|   ↓
| accepted
|
| At this point:
|
| - Driver is assigned.
| - All RideRequests are assigned to driver.
| - A single 4-digit OTP is generated.
|
| The ride does NOT start yet.
|
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
   * -------------------------------------------------------
   * Driver can only have one active group.
   * -------------------------------------------------------
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

  /*
   * -------------------------------------------------------
   * Generate OTP.
   * -------------------------------------------------------
   */

  const rideOtp = generateRideOtp();

  /*
   * -------------------------------------------------------
   * Atomically accept the group.
   *
   * The status must still be "ready".
   *
   * This prevents two drivers from accepting the same
   * group at the same time.
   * -------------------------------------------------------
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
      new: true,
    },
  );

  if (!group) {
    throw new Error("Ride group is already accepted or does not exist.");
  }

  /*
   * -------------------------------------------------------
   * Assign driver and accepted status to every rider's
   * RideRequest.
   * -------------------------------------------------------
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

  console.log(`[ride] Group ${group._id} accepted by driver ${driverId}.`);

  console.log(`[ride] OTP generated for group ${group._id}.`);

  /*
   * -------------------------------------------------------
   * Return populated group.
   * -------------------------------------------------------
   */

  return populateGroup(RideGroup.findById(group._id));
};

/*
|--------------------------------------------------------------------------
| Verify Ride OTP And Start Ride
|--------------------------------------------------------------------------
|
| Flow:
|
| accepted
|    ↓
| verify 4-digit OTP
|    ↓
| in_progress
|
| The same OTP is used for the entire RideGroup.
|
|--------------------------------------------------------------------------
*/

const verifyRideOtp = async (groupId, driverId, enteredOtp) => {
  if (!groupId) {
    throw new Error("Group ID is required.");
  }

  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  /*
   * Normalize OTP to a string.
   */

  const otp = String(enteredOtp || "").trim();

  /*
   * OTP must contain exactly four digits.
   */

  if (!/^\d{4}$/.test(otp)) {
    throw new Error("OTP must be exactly 4 digits.");
  }

  /*
   * -------------------------------------------------------
   * Find group assigned to this driver.
   * -------------------------------------------------------
   */

  const group = await RideGroup.findOne({
    _id: groupId,

    assignedDriver: driverId,

    status: "accepted",
  });

  if (!group) {
    throw new Error("Accepted ride group not found.");
  }

  /*
   * -------------------------------------------------------
   * Verify OTP.
   * -------------------------------------------------------
   */

  if (!group.rideOtp || group.rideOtp !== otp) {
    throw new Error("Incorrect ride OTP.");
  }

  /*
   * -------------------------------------------------------
   * Start the ride.
   * -------------------------------------------------------
   */

  const rideStartedAt = new Date();

  group.status = "in_progress";

  group.rideStartedAt = rideStartedAt;

  await group.save();

  /*
   * -------------------------------------------------------
   * Update every rider's RideRequest.
   * -------------------------------------------------------
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

  console.log(`[ride] Group ${group._id} started by driver ${driverId}.`);

  /*
   * -------------------------------------------------------
   * Return updated populated group.
   * -------------------------------------------------------
   */

  return populateGroup(RideGroup.findById(group._id));
};

/*
|--------------------------------------------------------------------------
| Complete Ride
|--------------------------------------------------------------------------
|
| Flow:
|
| in_progress
|      ↓
| completed
|
| All riders belonging to the group are also marked completed.
|
|--------------------------------------------------------------------------
*/

const completeRide = async (groupId, driverId) => {
  if (!groupId) {
    throw new Error("Group ID is required.");
  }

  if (!driverId) {
    throw new Error("Driver ID is required.");
  }

  /*
   * -------------------------------------------------------
   * Only the assigned driver can complete the group.
   *
   * The ride must already be in progress.
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * Save completion time.
   * -------------------------------------------------------
   */

  const rideCompletedAt = new Date();

  group.status = "completed";

  group.rideCompletedAt = rideCompletedAt;

  await group.save();

  /*
   * -------------------------------------------------------
   * Mark every RideRequest in this group as completed.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Return completed group.
   * -------------------------------------------------------
   */

  return populateGroup(RideGroup.findById(group._id));
};

/*
|--------------------------------------------------------------------------
| Accepted / Active Groups For Driver
|--------------------------------------------------------------------------
|
| This returns both:
|
| accepted
| in_progress
|
| This is useful because the driver needs to see the same ride
| after accepting it and after starting it.
|
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
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  /*
   * Existing grouping functionality
   */
  findOrCreateGroup,

  /*
   * Driver group functionality
   */
  getAvailableGroups,

  getGroupForRider,

  acceptGroup,

  getAcceptedGroupsForDriver,

  /*
   * New ride lifecycle functionality
   */
  verifyRideOtp,

  completeRide,
};
