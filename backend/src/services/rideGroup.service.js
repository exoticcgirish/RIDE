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
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ");
};


const normalizeELoc = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase();
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


const locationMatches = ({
  currentELoc,
  currentLocation,
  candidateELoc,
  candidateLocation,
}) => {


  const normalizedCurrentELoc =
    normalizeELoc(currentELoc);

  const normalizedCandidateELoc =
    normalizeELoc(candidateELoc);

  if (
    normalizedCurrentELoc &&
    normalizedCandidateELoc &&
    normalizedCurrentELoc ===
      normalizedCandidateELoc
  ) {
    return {
      matches: true,
      reason: "same-eloc",
    };
  }



  const normalizedCurrentLocation =
    normalize(currentLocation);

  const normalizedCandidateLocation =
    normalize(candidateLocation);

  if (
    normalizedCurrentLocation &&
    normalizedCandidateLocation &&
    normalizedCurrentLocation ===
      normalizedCandidateLocation
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
    !Number.isFinite(
      Number(coordinates.latitude),
    ) ||
    !Number.isFinite(
      Number(coordinates.longitude),
    )
  ) {
    return null;
  }

  return {
    type: "Point",

    coordinates: [
      Number(coordinates.longitude),
      Number(coordinates.latitude),
    ],
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

/*
|--------------------------------------------------------------------------
| Find Exact Seat Combination
|--------------------------------------------------------------------------
|
| Example:
|
| Rider A = 2
| Rider B = 1
| Rider C = 1
|
| Total = 4
|
|--------------------------------------------------------------------------
*/

const findExactSeatCombination = (
  requests,
  targetSeats,
) => {
  const result = [];

  const findCombination = (
    index,
    total,
  ) => {
    if (total === targetSeats) {
      return true;
    }

    if (total > targetSeats) {
      return false;
    }

    for (
      let i = index;
      i < requests.length;
      i++
    ) {
      const seats =
        Number(
          requests[i].seatsRequired,
        ) || 1;

      if (
        findCombination(
          i + 1,
          total + seats,
        )
      ) {
        result.push(
          requests[i],
        );

        return true;
      }
    }

    return false;
  };

  const found =
    findCombination(0, 0);

  if (!found) {
    return null;
  }

  return result.reverse();
};

/*
|--------------------------------------------------------------------------
| Find Or Create Group
|--------------------------------------------------------------------------
*/

const findOrCreateGroup = async (
  rideRequestInput,
) => {
  /*
   * -------------------------------------------------------
   * Find current RideRequest
   * -------------------------------------------------------
   */

  let rideRequest;

  if (
    rideRequestInput &&
    typeof rideRequestInput ===
      "object" &&
    rideRequestInput._id
  ) {
    rideRequest =
      await RideRequest.findById(
        rideRequestInput._id,
      );
  } else {
    rideRequest =
      await RideRequest.findById(
        rideRequestInput,
      );
  }

  if (!rideRequest) {
    throw new Error(
      "Ride request not found.",
    );
  }

  /*
   * -------------------------------------------------------
   * Already grouped
   * -------------------------------------------------------
   */

  if (rideRequest.groupId) {
    return populateGroup(
      RideGroup.findById(
        rideRequest.groupId,
      ),
    );
  }

  /*
   * -------------------------------------------------------
   * Current request information
   * -------------------------------------------------------
   */

  const pickupLocation =
    String(
      rideRequest.pickupLocation ||
        "",
    ).trim();

  const destination =
    String(
      rideRequest.destination ||
        "",
    ).trim();

  const pickupELoc =
    String(
      rideRequest.pickupELoc ||
        "",
    ).trim() || null;

  const destinationELoc =
    String(
      rideRequest.destinationELoc ||
        "",
    ).trim() || null;

  const departureDate =
    rideRequest.departureDate;

  const departureTime =
    String(
      rideRequest.departureTime ||
        "",
    ).trim();

  const seatsRequired =
    Number(
      rideRequest.seatsRequired,
    ) || 1;

  /*
   * -------------------------------------------------------
   * Validate basic fields
   * -------------------------------------------------------
   */

  if (!pickupLocation) {
    throw new Error(
      "pickupLocation is required.",
    );
  }

  if (!destination) {
    throw new Error(
      "destination is required.",
    );
  }

  if (!departureDate) {
    throw new Error(
      "departureDate is required.",
    );
  }

  if (!departureTime) {
    throw new Error(
      "departureTime is required.",
    );
  }

  if (
    seatsRequired < 1 ||
    seatsRequired > MAX_SEATS
  ) {
    throw new Error(
      `Seats required must be between 1 and ${MAX_SEATS}.`,
    );
  }

  /*
   * -------------------------------------------------------
   * IMPORTANT:
   *
   * Coordinates are NOT required anymore.
   *
   * The current system uses eLoc.
   * -------------------------------------------------------
   */

  console.log(
    "[grouping] Current ride location identifiers:",
    {
      pickupELoc,
      destinationELoc,
    },
  );

  /*
   * -------------------------------------------------------
   * Date boundaries
   * -------------------------------------------------------
   */

  const date =
    new Date(departureDate);

  const startOfDay =
    new Date(date);

  startOfDay.setHours(
    0,
    0,
    0,
    0,
  );

  const endOfDay =
    new Date(date);

  endOfDay.setHours(
    23,
    59,
    59,
    999,
  );

  /*
   * -------------------------------------------------------
   * Find waiting requests
   * -------------------------------------------------------
   */

  const waitingRequests =
    await RideRequest.find({
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

  console.log(
    `[grouping] Found ${waitingRequests.length} waiting candidates.`,
  );

  /*
   * -------------------------------------------------------
   * Location compatibility
   * -------------------------------------------------------
   */

  const compatibleRequests =
    waitingRequests.filter(
      (request) => {
        /*
         * ---------------------------------------------------
         * Date
         * ---------------------------------------------------
         */

        if (
          !isSameDate(
            request.departureDate,
            departureDate,
          )
        ) {
          return false;
        }

        /*
         * ---------------------------------------------------
         * Time
         * ---------------------------------------------------
         */

        if (
          !isSameTime(
            request.departureTime,
            departureTime,
          )
        ) {
          return false;
        }

        /*
         * ---------------------------------------------------
         * Pickup
         * ---------------------------------------------------
         */

        const pickupMatch =
          locationMatches({
            currentELoc:
              pickupELoc,

            currentLocation:
              pickupLocation,

            candidateELoc:
              request.pickupELoc,

            candidateLocation:
              request.pickupLocation,
          });

        if (!pickupMatch.matches) {
          return false;
        }

        /*
         * ---------------------------------------------------
         * Destination
         * ---------------------------------------------------
         */

        const destinationMatch =
          locationMatches({
            currentELoc:
              destinationELoc,

            currentLocation:
              destination,

            candidateELoc:
              request.destinationELoc,

            candidateLocation:
              request.destination,
          });

        if (
          !destinationMatch.matches
        ) {
          return false;
        }

        /*
         * ---------------------------------------------------
         * Seats
         * ---------------------------------------------------
         */

        const seats =
          Number(
            request.seatsRequired,
          ) || 1;

        if (
          seats < 1 ||
          seats > MAX_SEATS
        ) {
          return false;
        }

        console.log(
          "[grouping] Compatible ride found:",
          {
            rideRequestId:
              request._id.toString(),

            pickupELoc:
              request.pickupELoc,

            destinationELoc:
              request.destinationELoc,

            seats,
          },
        );

        return true;
      },
    );

  console.log(
    `[grouping] ${compatibleRequests.length} compatible requests found.`,
  );

  /*
   * -------------------------------------------------------
   * Include current request
   * -------------------------------------------------------
   */

  const allCompatible = [
    rideRequest,
    ...compatibleRequests,
  ];

  /*
   * -------------------------------------------------------
   * Find exact 4-seat combination
   * -------------------------------------------------------
   */

  const combination =
    findExactSeatCombination(
      allCompatible,
      MAX_SEATS,
    );

  if (!combination) {
    console.log(
      "[grouping] No exact 4-seat combination found.",
    );

    return null;
  }

  /*
   * -------------------------------------------------------
   * Calculate total seats
   * -------------------------------------------------------
   */

  const totalSeats =
    combination.reduce(
      (total, request) => {
        return (
          total +
          (Number(
            request.seatsRequired,
          ) || 1)
        );
      },
      0,
    );

  if (
    totalSeats !== MAX_SEATS
  ) {
    console.log(
      "[grouping] Combination does not contain exactly 4 seats.",
    );

    return null;
  }

  /*
   * -------------------------------------------------------
   * Member IDs
   * -------------------------------------------------------
   */

  const memberIds =
    combination.map(
      (request) =>
        request._id,
    );

  console.log(
    "[grouping] Creating group with members:",
    memberIds.map((id) =>
      id.toString(),
    ),
  );

  /*
   * -------------------------------------------------------
   * Use current ride's location information
   * -------------------------------------------------------
   */

  const pickupCoordinates =
    rideRequest.pickupCoordinates ||
    null;

  const destinationCoordinates =
    rideRequest.destinationCoordinates ||
    null;

  /*
   * -------------------------------------------------------
   * Build group data
   * -------------------------------------------------------
   *
   * Coordinates are OPTIONAL.
   *
   * eLoc is the current source of truth.
   * -------------------------------------------------------
   */

  const groupData = {
    members: memberIds,

    pickupLocation,

    pickupELoc:
      pickupELoc,

    destination,

    destinationELoc:
      destinationELoc,

    departureDate,

    departureTime,

    totalSeats:
      MAX_SEATS,

    maxSeats:
      MAX_SEATS,

    status: "ready",

    assignedDriver: null,
  };

  /*
   * -------------------------------------------------------
   * Preserve coordinates only if available
   * -------------------------------------------------------
   */

  if (
    pickupCoordinates &&
    Number.isFinite(
      Number(
        pickupCoordinates.latitude,
      ),
    ) &&
    Number.isFinite(
      Number(
        pickupCoordinates.longitude,
      ),
    )
  ) {
    groupData.pickupCoordinates = {
      latitude: Number(
        pickupCoordinates.latitude,
      ),

      longitude: Number(
        pickupCoordinates.longitude,
      ),
    };

    const pickupPoint =
      makePoint(
        pickupCoordinates,
      );

    if (pickupPoint) {
      groupData.pickupPoint =
        pickupPoint;
    }
  }

  if (
    destinationCoordinates &&
    Number.isFinite(
      Number(
        destinationCoordinates.latitude,
      ),
    ) &&
    Number.isFinite(
      Number(
        destinationCoordinates.longitude,
      ),
    )
  ) {
    groupData.destinationCoordinates =
      {
        latitude: Number(
          destinationCoordinates.latitude,
        ),

        longitude: Number(
          destinationCoordinates.longitude,
        ),
      };

    const destinationPoint =
      makePoint(
        destinationCoordinates,
      );

    if (destinationPoint) {
      groupData.destinationPoint =
        destinationPoint;
    }
  }

  /*
   * -------------------------------------------------------
   * Create RideGroup
   * -------------------------------------------------------
   */

  const group =
    await RideGroup.create(
      groupData,
    );

  console.log(
    "[grouping] RideGroup created:",
    group._id.toString(),
  );

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
        groupId:
          group._id,

        status:
          "grouped",
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

  return populateGroup(
    RideGroup.findById(
      group._id,
    ),
  );
};

/*
|--------------------------------------------------------------------------
| Available Groups For Driver
|--------------------------------------------------------------------------
*/

const getAvailableGroups =
  async (driverId) => {
    if (!driverId) {
      throw new Error(
        "Driver ID is required.",
      );
    }

    const existingAcceptedGroup =
      await RideGroup.findOne({
        assignedDriver:
          driverId,

        status:
          "accepted",
      }).select("_id");

    if (
      existingAcceptedGroup
    ) {
      return [];
    }

    return populateGroup(
      RideGroup.find({
        status: "ready",

        $or: [
          {
            assignedDriver:
              null,
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

const getGroupForRider =
  async (riderId) => {
    if (!riderId) {
      throw new Error(
        "Rider ID is required.",
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
          "_id groupId status",
        );

    if (!rideRequest) {
      return null;
    }

    if (!rideRequest.groupId) {
      return null;
    }

    return populateGroup(
      RideGroup.findById(
        rideRequest.groupId,
      ),
    );
  };

/*
|--------------------------------------------------------------------------
| Accept Group
|--------------------------------------------------------------------------
*/

const acceptGroup =
  async (
    groupId,
    driverId,
  ) => {
    if (!groupId) {
      throw new Error(
        "Group ID is required.",
      );
    }

    if (!driverId) {
      throw new Error(
        "Driver ID is required.",
      );
    }

    /*
     * Driver can only have one
     * accepted group.
     */

    const existingAcceptedGroup =
      await RideGroup.findOne({
        assignedDriver:
          driverId,

        status:
          "accepted",
      }).select("_id");

    if (
      existingAcceptedGroup
    ) {
      throw new Error(
        "You have already accepted a ride group. You cannot accept another group.",
      );
    }

    /*
     * Atomically accept group.
     */

    const group =
      await RideGroup.findOneAndUpdate(
        {
          _id: groupId,

          status: "ready",

          $or: [
            {
              assignedDriver:
                null,
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
            assignedDriver:
              driverId,

            status:
              "accepted",
          },
        },

        {
          new: true,
        },
      );

    if (!group) {
      throw new Error(
        "Ride group is already accepted or does not exist.",
      );
    }

    /*
     * Assign driver to every
     * RideRequest in the group.
     */

    await RideRequest.updateMany(
      {
        _id: {
          $in:
            group.members,
        },
      },

      {
        $set: {
          status:
            "accepted",

          assignedDriver:
            driverId,

          groupId:
            group._id,
        },
      },
    );

    return populateGroup(
      RideGroup.findById(
        group._id,
      ),
    );
  };

/*
|--------------------------------------------------------------------------
| Accepted Groups For Driver
|--------------------------------------------------------------------------
*/

const getAcceptedGroupsForDriver =
  async (driverId) => {
    if (!driverId) {
      throw new Error(
        "Driver ID is required.",
      );
    }

    return populateGroup(
      RideGroup.find({
        assignedDriver:
          driverId,

        status:
          "accepted",
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
  findOrCreateGroup,

  getAvailableGroups,

  getGroupForRider,

  acceptGroup,

  getAcceptedGroupsForDriver,
};