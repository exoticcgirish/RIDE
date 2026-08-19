const RideGroup = require("../models/RideGroup.js");
const RideRequest = require("../models/RideRequest.js");

const MAX_SEATS = 4;

const DRIVER_FIELDS =
  "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor";

const RIDER_FIELDS =
  "full_name name email phone college";

const normalize = (value) => {
  return value
    ? String(value).trim().toLowerCase()
    : "";
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) {
    return false;
  }

  const first = new Date(date1);
  const second = new Date(date2);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const isSameTime = (time1, time2) => {
  return String(time1 || "") === String(time2 || "");
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

const findOrCreateGroup = async (
  rideRequestInput
) => {
  let rideRequest;

  if (
    rideRequestInput &&
    typeof rideRequestInput === "object" &&
    rideRequestInput._id
  ) {
    rideRequest = rideRequestInput;
  } else {
    rideRequest =
      await RideRequest.findById(
        rideRequestInput
      );
  }

  if (!rideRequest) {
    throw new Error(
      "Ride request not found"
    );
  }

  const seatsRequired =
    Number(rideRequest.seatsRequired) || 1;

  if (seatsRequired > MAX_SEATS) {
    throw new Error(
      `Maximum group capacity is ${MAX_SEATS} seats`
    );
  }

  if (seatsRequired <= 0) {
    throw new Error(
      "Seats required must be at least 1"
    );
  }

  const pickup = normalize(
    rideRequest.pickupLocation
  );

  const destination = normalize(
    rideRequest.destination
  );

  const groups = await RideGroup.find({
    status: "waiting",
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
  });

  let group = null;

  for (const existingGroup of groups) {
    const samePickup =
      normalize(
        existingGroup.pickupLocation
      ) === pickup;

    const sameDestination =
      normalize(
        existingGroup.destination
      ) === destination;

    const sameDate = isSameDate(
      existingGroup.departureDate,
      rideRequest.departureDate
    );

    const sameTime = isSameTime(
      existingGroup.departureTime,
      rideRequest.departureTime
    );

    const currentSeats =
      Number(existingGroup.totalSeats) || 0;

    const maxSeats =
      Number(existingGroup.maxSeats) ||
      MAX_SEATS;

    const enoughSpace =
      currentSeats + seatsRequired <=
      maxSeats;

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
    const alreadyMember =
      group.members.some(
        (memberId) =>
          String(memberId) ===
          String(rideRequest._id)
      );

    if (!alreadyMember) {
      group.members.push(
        rideRequest._id
      );

      group.totalSeats =
        (Number(group.totalSeats) || 0) +
        seatsRequired;
    }

    const totalSeats =
      Number(group.totalSeats) || 0;

    const maxSeats =
      Number(group.maxSeats) ||
      MAX_SEATS;

    if (totalSeats >= maxSeats) {
      group.status = "ready";
    } else {
      group.status = "waiting";
    }

    await group.save();
  }

  await RideRequest.updateMany(
    {
      _id: {
        $in: group.members,
      },
    },
    {
      $set: {
        groupId: group._id,
        status: "grouped",
      },
    }
  );

  return await populateGroup(
    RideGroup.findById(group._id)
  );
};

const getAvailableGroups = async () => {
  return await populateGroup(
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
    })
  );
};

const getGroupForRider = async (
  riderId
) => {
  const rideRequest =
    await RideRequest.findOne({
      rider: riderId,
    })
      .sort({
        createdAt: -1,
      })
      .select("_id groupId");

  if (!rideRequest) {
    return null;
  }

  let group = null;

  if (rideRequest.groupId) {
    group = await populateGroup(
      RideGroup.findById(
        rideRequest.groupId
      )
    );
  }

  if (!group) {
    group = await populateGroup(
      RideGroup.findOne({
        members: rideRequest._id,
      })
    );
  }

  return group;
};

const acceptGroup = async (
  groupId,
  driverId
) => {
  if (!groupId) {
    throw new Error(
      "Group ID is required"
    );
  }

  if (!driverId) {
    throw new Error(
      "Driver ID is required"
    );
  }

  const group =
    await RideGroup.findOneAndUpdate(
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
        },
      },
      {
        new: true,
      }
    );

  if (!group) {
    throw new Error(
      "Ride group is already accepted or does not exist."
    );
  }

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
    }
  );

  return await populateGroup(
    RideGroup.findById(group._id)
  );
};

const getAcceptedGroupsForDriver =
  async (driverId) => {
    if (!driverId) {
      throw new Error(
        "Driver ID is required"
      );
    }

    return await populateGroup(
      RideGroup.find({
        assignedDriver: driverId,
        status: "accepted",
      }).sort({
        departureDate: 1,
        departureTime: 1,
      })
    );
  };

module.exports = {
  findOrCreateGroup,
  getAvailableGroups,
  getGroupForRider,
  acceptGroup,
  getAcceptedGroupsForDriver,
};