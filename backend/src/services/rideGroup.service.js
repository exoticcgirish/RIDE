const RideGroup = require("../models/RideGroup.js");
const RideRequest = require("../models/RideRequest.js");

const MAX_SEATS = 4;

const DRIVER_FIELDS =
  "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor";

const RIDER_FIELDS =
  "full_name name email phone college";

const normalize = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const isSameDate = (date1, date2) => {
  if (!date1 || !date2) {
    return false;
  }

  const first = new Date(date1);
  const second = new Date(date2);

  if (
    Number.isNaN(first.getTime()) ||
    Number.isNaN(second.getTime())
  ) {
    return false;
  }

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const isSameTime = (time1, time2) => {
  return (
    String(time1 || "").trim() ===
    String(time2 || "").trim()
  );
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

const findExactSeatCombination = (
  requests,
  targetSeats
) => {
  const result = [];

  const findCombination = (index, total) => {
    if (total === targetSeats) {
      return true;
    }

    if (total > targetSeats) {
      return false;
    }

    for (let i = index; i < requests.length; i++) {
      const seats =
        Number(requests[i].seatsRequired) || 1;

      if (
        findCombination(
          i + 1,
          total + seats
        )
      ) {
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

const findOrCreateGroup = async (
  rideRequestInput
) => {
  let rideRequest;

  if (
    rideRequestInput &&
    typeof rideRequestInput === "object" &&
    rideRequestInput._id
  ) {
    rideRequest =
      await RideRequest.findById(
        rideRequestInput._id
      );
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

  if (rideRequest.groupId) {
    return populateGroup(
      RideGroup.findById(
        rideRequest.groupId
      )
    );
  }

  const pickupLocation = String(
    rideRequest.pickupLocation || ""
  ).trim();

  const destination = String(
    rideRequest.destination || ""
  ).trim();

  const departureDate =
    rideRequest.departureDate;

  const departureTime = String(
    rideRequest.departureTime || ""
  ).trim();

  const seatsRequired =
    Number(
      rideRequest.seatsRequired
    ) || 1;

  if (!pickupLocation) {
    throw new Error(
      "pickupLocation is required"
    );
  }

  if (!destination) {
    throw new Error(
      "destination is required"
    );
  }

  if (!departureDate) {
    throw new Error(
      "departureDate is required"
    );
  }

  if (!departureTime) {
    throw new Error(
      "departureTime is required"
    );
  }

  if (
    seatsRequired < 1 ||
    seatsRequired > MAX_SEATS
  ) {
    throw new Error(
      `Seats required must be between 1 and ${MAX_SEATS}`
    );
  }

  const pickup =
    normalize(pickupLocation);

  const destinationNormalized =
    normalize(destination);

  const waitingRequests =
    await RideRequest.find({
      status: "waiting",
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
    }).sort({
      createdAt: 1,
    });

  const compatibleRequests =
    waitingRequests.filter(
      (request) => {
        const samePickup =
          normalize(
            request.pickupLocation
          ) === pickup;

        const sameDestination =
          normalize(
            request.destination
          ) === destinationNormalized;

        const sameDate =
          isSameDate(
            request.departureDate,
            departureDate
          );

        const sameTime =
          isSameTime(
            request.departureTime,
            departureTime
          );

        const seats =
          Number(
            request.seatsRequired
          ) || 1;

        return (
          samePickup &&
          sameDestination &&
          sameDate &&
          sameTime &&
          seats <= MAX_SEATS
        );
      }
    );

  const combination =
    findExactSeatCombination(
      compatibleRequests,
      MAX_SEATS
    );

  if (!combination) {
    return null;
  }

  const memberIds =
    combination.map(
      (request) => request._id
    );

  const totalSeats =
    combination.reduce(
      (total, request) => {
        return (
          total +
          (Number(
            request.seatsRequired
          ) || 1)
        );
      },
      0
    );

  if (totalSeats !== MAX_SEATS) {
    return null;
  }

  const group =
    await RideGroup.create({
      members: memberIds,

      pickupLocation,

      destination,

      departureDate,

      departureTime,

      totalSeats: MAX_SEATS,

      maxSeats: MAX_SEATS,

      status: "ready",

      assignedDriver: null,
    });

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
    }
  );

  return populateGroup(
    RideGroup.findById(
      group._id
    )
  );
};

const getAvailableGroups =
  async () => {
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
      })
    );
  };

const getGroupForRider =
  async (riderId) => {
    if (!riderId) {
      throw new Error(
        "Rider ID is required"
      );
    }

    const rideRequest =
      await RideRequest.findOne({
        rider: riderId,
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "_id groupId status"
        );

    if (!rideRequest) {
      return null;
    }

    if (!rideRequest.groupId) {
      return null;
    }

    return populateGroup(
      RideGroup.findById(
        rideRequest.groupId
      )
    );
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

  return populateGroup(
    RideGroup.findById(
      group._id
    )
  );
};

const getAcceptedGroupsForDriver =
  async (driverId) => {
    if (!driverId) {
      throw new Error(
        "Driver ID is required"
      );
    }

    return populateGroup(
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