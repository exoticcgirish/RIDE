const RideGroup = require("../models/RideGroup.js");
const RideRequest = require("../models/RideRequest.js");

const MAX_SEATS = 4;

const normalize = (value) => {
  return value ? value.trim().toLowerCase() : "";
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;

  const first = new Date(date1);
  const second = new Date(date2);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const isSameTime = (time1, time2) => {
  return time1 === time2;
};


// ==========================================
// FIND OR CREATE GROUP
// ==========================================

const findOrCreateGroup = async (rideRequestId) => {
  const rideRequest = await RideRequest.findById(rideRequestId);

  if (!rideRequest) {
    throw new Error("Ride request not found");
  }

  const seatsRequired =
    Number(rideRequest.seatsRequired) || 1;

  if (seatsRequired > MAX_SEATS) {
    throw new Error(
      `Maximum group capacity is ${MAX_SEATS} seats`
    );
  }

  const pickup = normalize(
    rideRequest.pickupLocation
  );

  const destination = normalize(
    rideRequest.destination
  );

  // ------------------------------------------
  // FIND WAITING GROUP
  // ------------------------------------------

  const groups = await RideGroup.find({
    status: "waiting",
    assignedDriver: null,
  });

  let group = null;

  for (const existingGroup of groups) {
    const samePickup =
      normalize(existingGroup.pickupLocation) ===
      pickup;

    const sameDestination =
      normalize(existingGroup.destination) ===
      destination;

    const sameDate = isSameDate(
      existingGroup.departureDate,
      rideRequest.departureDate
    );

    const sameTime = isSameTime(
      existingGroup.departureTime,
      rideRequest.departureTime
    );

    const enoughSpace =
      existingGroup.totalSeats + seatsRequired <=
      existingGroup.maxSeats;

    if (
      samePickup &&
      sameDestination &&
      sameDate &&
      sameTime &&
      enoughSpace
    ) {
      group = existingGroup;
      break;
    }
  }

  // ------------------------------------------
  // CREATE NEW GROUP
  // ------------------------------------------

  if (!group) {
    group = await RideGroup.create({
      members: [rideRequest._id],

      pickupLocation:
        rideRequest.pickupLocation,

      destination:
        rideRequest.destination,

      departureDate:
        rideRequest.departureDate,

      departureTime:
        rideRequest.departureTime,

      totalSeats: seatsRequired,

      maxSeats: MAX_SEATS,

      status:
        seatsRequired >= MAX_SEATS
          ? "ready"
          : "waiting",

      assignedDriver: null,
    });
  } else {

    // ----------------------------------------
    // ADD RIDER TO EXISTING GROUP
    // ----------------------------------------

    const alreadyMember =
      group.members.some(
        (memberId) =>
          memberId.toString() ===
          rideRequest._id.toString()
      );

    if (!alreadyMember) {
      group.members.push(rideRequest._id);

      group.totalSeats += seatsRequired;
    }

    // Full group
    if (group.totalSeats >= group.maxSeats) {
      group.status = "ready";
    }

    await group.save();
  }

  // ------------------------------------------
  // UPDATE RIDE REQUEST
  // ------------------------------------------

  await RideRequest.findByIdAndUpdate(
    rideRequest._id,
    {
      groupId: group._id,

      status:
        group.status === "ready"
          ? "grouped"
          : "waiting",
    }
  );

  return group;
};


// ==========================================
// GET AVAILABLE GROUPS
// ==========================================

const getAvailableGroups = async () => {
  return await RideGroup.find({
    status: "ready",
    assignedDriver: null,
  })
    .populate({
      path: "members",
      populate: {
        path: "rider",
        select:
          "full_name name email phone college",
      },
    })
    .sort({
      departureDate: 1,
      departureTime: 1,
    });
};


// ==========================================
// GET GROUP FOR RIDER
// ==========================================

const getGroupForRider = async (riderId) => {
  const rideRequest = await RideRequest.findOne({
    rider: riderId,
  })
    .sort({ createdAt: -1 })
    .select("_id");

  if (!rideRequest) {
    return null;
  }

  return RideGroup.findOne({
    members: rideRequest._id,
  })
    .populate({
      path: "assignedDriver",
      select:
        "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor",
    })
    .populate({
      path: "members",
      populate: {
        path: "rider",
        select:
          "full_name name email phone college",
      },
    });
};


// ==========================================
// ACCEPT GROUP
// ==========================================

const acceptGroup = async (groupId, driverId) => {
  const group = await RideGroup.findOneAndUpdate(
    {
      _id: groupId,
      status: "ready",
      assignedDriver: null,
    },
    {
      $set: {
        assignedDriver: driverId,
        status: "accepted",
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "assignedDriver",
      select:
        "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor",
    })
    .populate({
      path: "members",
      populate: {
        path: "rider",
        select:
          "full_name name email phone college",
      },
    });

  if (!group) {
    throw new Error(
      "Ride group is already accepted or does not exist."
    );
  }

  // Update every ride request in group
  await RideRequest.updateMany(
    {
      _id: {
        $in: group.members.map(
          (member) => member._id
        ),
      },
    },
    {
      $set: {
        status: "accepted",
        assignedDriver: driverId,
      },
    }
  );

  return group;
};


module.exports = {
  findOrCreateGroup,
  getGroupForRider,
  getAvailableGroups,
  acceptGroup,
};