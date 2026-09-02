const RideRequest = require("../models/RideRequest.js");
const dbFallback = require("../dbFallback.js");

const {
  findOrCreateGroup,
} = require("./rideGroup.service.js");

const {
  sendMessage,
} = require("../rabbitmq/producer.js");

const DRIVER_FIELDS =
  "full_name name email phone vehicleType vehicleNumber vehicleModel vehicleColor";

/*
|--------------------------------------------------------------------------
| Create Ride Request
|--------------------------------------------------------------------------
|
| CURRENT LOCATION STRATEGY
|
| We store the Mappls eLoc directly.
|
| We DO NOT resolve latitude/longitude here.
|
| Coordinate resolution will be added later as a separate feature.
|
|--------------------------------------------------------------------------
*/

const createRideRequest = async (
  riderId,
  data,
) => {
  if (dbFallback.isEnabled()) {
    return dbFallback.createRideRequest(
      riderId,
      data,
    );
  }

  /*
   * -------------------------------------------------------
   * Basic fields
   * -------------------------------------------------------
   */

  const pickupLocation =
    String(
      data.pickupLocation || "",
    ).trim();

  const destination =
    String(
      data.destination || "",
    ).trim();

  const pickupELoc =
    String(
      data.pickupELoc || "",
    ).trim() || null;

  const destinationELoc =
    String(
      data.destinationELoc || "",
    ).trim() || null;

  const pickupPlaceName =
    String(
      data.pickupPlaceName || "",
    ).trim() || null;

  const pickupPlaceAddress =
    String(
      data.pickupPlaceAddress || "",
    ).trim() || null;

  const destinationPlaceName =
    String(
      data.destinationPlaceName || "",
    ).trim() || null;

  const destinationPlaceAddress =
    String(
      data.destinationPlaceAddress || "",
    ).trim() || null;

  const departureDate =
    data.departureDate;

  const departureTime =
    String(
      data.departureTime || "",
    ).trim();

  const seatsRequired =
    Number(
      data.seatsRequired,
    ) || 1;

  /*
   * -------------------------------------------------------
   * Validate
   * -------------------------------------------------------
   */

  if (!pickupLocation) {
    throw new Error(
      "pickupLocation is required",
    );
  }

  if (!pickupELoc) {
    throw new Error(
      "pickupELoc is required. Please select the pickup location from Mappls.",
    );
  }

  if (!destination) {
    throw new Error(
      "destination is required",
    );
  }

  if (!destinationELoc) {
    throw new Error(
      "destinationELoc is required. Please select the destination from Mappls.",
    );
  }

  if (!departureDate) {
    throw new Error(
      "departureDate is required",
    );
  }

  if (!departureTime) {
    throw new Error(
      "departureTime is required",
    );
  }

  if (
    seatsRequired < 1 ||
    seatsRequired > 4
  ) {
    throw new Error(
      "Seats required must be between 1 and 4",
    );
  }

  /*
   * -------------------------------------------------------
   * Log selected Mappls locations
   * -------------------------------------------------------
   */

  console.log(
    "[rideRequest] Creating ride using Mappls eLocs:",
    {
      pickupLocation,
      pickupELoc,

      destination,
      destinationELoc,
    },
  );

  /*
   * -------------------------------------------------------
   * Create RideRequest
   * -------------------------------------------------------
   *
   * IMPORTANT:
   *
   * No coordinate resolver is called.
   *
   * No Gemini.
   *
   * No OpenStreetMap.
   *
   * No latitude/longitude.
   *
   * No GeoJSON.
   *
   * The Mappls eLoc is the location identifier for now.
   */

  const rideRequestData = {
    rider: riderId,

    /*
     * Full selected Mappls address
     */
    pickupLocation,

    destination,

    /*
     * Mappls eLoc
     */
    pickupELoc,

    destinationELoc,

    /*
     * Place information
     */
    pickupPlaceName,

    pickupPlaceAddress,

    destinationPlaceName,

    destinationPlaceAddress,

    /*
     * Trip information
     */
    departureDate,

    departureTime,

    seatsRequired,

    notes:
      data.notes || "",

    status: "waiting",

    assignedDriver: null,

    trip: null,

    groupId: null,
  };

  /*
   * -------------------------------------------------------
   * Create MongoDB document
   * -------------------------------------------------------
   */

  const rideRequest =
    await RideRequest.create(
      rideRequestData,
    );

  console.log(
    "[rideRequest] Ride request created:",
    rideRequest._id.toString(),
  );

  /*
   * -------------------------------------------------------
   * Automatic Grouping
   * -------------------------------------------------------
   */

  let group = null;

  try {
    group =
      await findOrCreateGroup(
        rideRequest._id,
      );
  } catch (error) {
    console.error(
      "[rideRequest] Grouping error:",
      error.message,
    );

    throw error;
  }

  /*
   * -------------------------------------------------------
   * RabbitMQ group event
   * -------------------------------------------------------
   */

  if (group) {
    console.log(
      "[rideRequest] Ride group created:",
      group._id.toString(),
    );

    try {
      await sendMessage(
        "group_created",
        {
          groupId:
            group._id.toString(),

          rideRequestId:
            rideRequest._id.toString(),

          riderId:
            riderId.toString(),

          pickupLocation:
            group.pickupLocation,

          destination:
            group.destination,

          departureDate:
            group.departureDate,

          departureTime:
            group.departureTime,

          totalSeats:
            group.totalSeats,

          maxSeats:
            group.maxSeats,

          status:
            group.status,
        },
      );

      console.log(
        "[rideRequest] RabbitMQ group event sent.",
      );
    } catch (rabbitError) {
      /*
       * Do not fail ride creation
       * because RabbitMQ failed.
       */

      console.error(
        "[rideRequest] RabbitMQ group event failed:",
        rabbitError.message,
      );
    }
  } else {
    console.log(
      "[rideRequest] No group created. Waiting for compatible riders.",
    );
  }

  /*
   * -------------------------------------------------------
   * Populate response
   * -------------------------------------------------------
   */

  const updatedRideRequest =
    await RideRequest.findById(
      rideRequest._id,
    )
      .populate({
        path: "assignedDriver",
        select:
          DRIVER_FIELDS,
      })
      .populate({
        path: "groupId",
        populate: {
          path:
            "assignedDriver",
          select:
            DRIVER_FIELDS,
        },
      });

  return {
    rideRequest:
      updatedRideRequest,

    group,
  };
};

/*
|--------------------------------------------------------------------------
| Get My Ride Requests
|--------------------------------------------------------------------------
*/

const getMyRideRequests =
  async (riderId) => {
    if (dbFallback.isEnabled()) {
      return dbFallback.getRideRequestsByRider(
        riderId,
      );
    }

    return await RideRequest.find({
      rider: riderId,
    })
      .populate({
        path: "assignedDriver",
        select:
          DRIVER_FIELDS,
      })
      .populate({
        path: "groupId",
        populate: {
          path:
            "assignedDriver",
          select:
            DRIVER_FIELDS,
        },
      })
      .sort({
        createdAt: -1,
      });
  };

/*
|--------------------------------------------------------------------------
| Get Ride Request By ID
|--------------------------------------------------------------------------
*/

const getRideRequestById =
  async (id) => {
    if (dbFallback.isEnabled()) {
      return dbFallback.getRideRequestById(
        id,
      );
    }

    return await RideRequest.findById(id)
      .populate(
        "rider",
        "name full_name email phone college",
      )
      .populate({
        path: "assignedDriver",
        select:
          DRIVER_FIELDS,
      })
      .populate("trip")
      .populate({
        path: "groupId",
        populate: {
          path:
            "assignedDriver",
          select:
            DRIVER_FIELDS,
        },
      });
  };

/*
|--------------------------------------------------------------------------
| Update Ride Request
|--------------------------------------------------------------------------
*/

const updateRideRequest =
  async (
    id,
    data,
    riderId = null,
  ) => {
    if (dbFallback.isEnabled()) {
      return dbFallback.updateRideRequest(
        id,
        data,
      );
    }

    const query = {
      _id: id,
    };

    if (riderId) {
      query.rider = riderId;
    }

    /*
     * -------------------------------------------------------
     * Build update data
     * -------------------------------------------------------
     */

    const updateData = {
      ...data,
    };

    /*
     * -------------------------------------------------------
     * Pickup update
     * -------------------------------------------------------
     *
     * CURRENTLY we only update:
     *
     * pickupLocation
     * pickupELoc
     * pickupPlaceName
     * pickupPlaceAddress
     *
     * No coordinate resolution.
     */

    if (
      data.pickupLocation ||
      data.pickupELoc ||
      data.pickupPlaceName ||
      data.pickupPlaceAddress
    ) {
      if (
        data.pickupLocation !==
          undefined &&
        !String(
          data.pickupLocation || "",
        ).trim()
      ) {
        throw new Error(
          "pickupLocation cannot be empty",
        );
      }

      if (
        data.pickupELoc !==
          undefined &&
        !String(
          data.pickupELoc || "",
        ).trim()
      ) {
        throw new Error(
          "pickupELoc is required when updating pickup location",
        );
      }

      console.log(
        "[rideRequest] Updating pickup using Mappls eLoc:",
        {
          pickupLocation:
            data.pickupLocation,

          pickupELoc:
            data.pickupELoc,
        },
      );
    }

    /*
     * -------------------------------------------------------
     * Destination update
     * -------------------------------------------------------
     *
     * CURRENTLY we only update:
     *
     * destination
     * destinationELoc
     * destinationPlaceName
     * destinationPlaceAddress
     *
     * No coordinate resolution.
     */

    if (
      data.destination ||
      data.destinationELoc ||
      data.destinationPlaceName ||
      data.destinationPlaceAddress
    ) {
      if (
        data.destination !==
          undefined &&
        !String(
          data.destination || "",
        ).trim()
      ) {
        throw new Error(
          "destination cannot be empty",
        );
      }

      if (
        data.destinationELoc !==
          undefined &&
        !String(
          data.destinationELoc || "",
        ).trim()
      ) {
        throw new Error(
          "destinationELoc is required when updating destination",
        );
      }

      console.log(
        "[rideRequest] Updating destination using Mappls eLoc:",
        {
          destination:
            data.destination,

          destinationELoc:
            data.destinationELoc,
        },
      );
    }

    /*
     * -------------------------------------------------------
     * Remove old coordinate fields when a location
     * is changed.
     * -------------------------------------------------------
     *
     * We are not using coordinates currently.
     *
     * This prevents old coordinates from remaining
     * attached to a newly selected eLoc.
     */

    const unsetData = {};

    if (
      data.pickupLocation ||
      data.pickupELoc
    ) {
      unsetData.pickupCoordinates = 1;
      unsetData.pickupPoint = 1;
    }

    if (
      data.destination ||
      data.destinationELoc
    ) {
      unsetData.destinationCoordinates = 1;
      unsetData.destinationPoint = 1;
    }

    /*
     * -------------------------------------------------------
     * Update MongoDB
     * -------------------------------------------------------
     */

    const updateOperation = {
      $set: updateData,
    };

    if (
      Object.keys(
        unsetData,
      ).length > 0
    ) {
      updateOperation.$unset =
        unsetData;
    }

    return await RideRequest.findOneAndUpdate(
      query,
      updateOperation,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate({
        path: "assignedDriver",
        select:
          DRIVER_FIELDS,
      })
      .populate({
        path: "groupId",
        populate: {
          path:
            "assignedDriver",
          select:
            DRIVER_FIELDS,
        },
      });
  };

/*
|--------------------------------------------------------------------------
| Cancel Ride Request
|--------------------------------------------------------------------------
*/

const cancelRideRequest =
  async (
    id,
    riderId = null,
  ) => {
    if (dbFallback.isEnabled()) {
      return dbFallback.cancelRideRequest(
        id,
      );
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
          status:
            "cancelled",
        },
      },
      {
        new: true,
      },
    );
  };

/*
|--------------------------------------------------------------------------
| Delete Ride Request
|--------------------------------------------------------------------------
*/

const deleteRideRequest =
  async (
    id,
    riderId = null,
  ) => {
    if (dbFallback.isEnabled()) {
      return dbFallback.deleteRideRequest(
        id,
      );
    }

    const query = {
      _id: id,
    };

    if (riderId) {
      query.rider = riderId;
    }

    return await RideRequest.findOneAndDelete(
      query,
    );
  };

/*
|--------------------------------------------------------------------------
| Search Ride Requests
|--------------------------------------------------------------------------
*/

const searchRideRequests =
  async (
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
        $in: [
          "waiting",
          "grouped",
        ],
      },
    };

    if (pickupLocation) {
      query.pickupLocation = {
        $regex:
          pickupLocation,
        $options: "i",
      };
    }

    if (destination) {
      query.destination = {
        $regex:
          destination,
        $options: "i",
      };
    }

    if (departureDate) {
      const startOfDay =
        new Date(
          departureDate,
        );

      startOfDay.setHours(
        0,
        0,
        0,
        0,
      );

      const endOfDay =
        new Date(
          departureDate,
        );

      endOfDay.setHours(
        23,
        59,
        59,
        999,
      );

      query.departureDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    return await RideRequest.find(
      query,
    )
      .populate(
        "rider",
        "name full_name phone",
      )
      .populate({
        path: "assignedDriver",
        select:
          DRIVER_FIELDS,
      })
      .populate({
        path: "groupId",
        populate: {
          path:
            "assignedDriver",
          select:
            DRIVER_FIELDS,
        },
      })
      .sort({
        departureDate: 1,
        departureTime: 1,
      });
  };

/*
|--------------------------------------------------------------------------
| Assign Driver
|--------------------------------------------------------------------------
*/

const assignDriver =
  async (
    rideRequestId,
    driverId,
    tripId = null,
  ) => {
    if (dbFallback.isEnabled()) {
      return dbFallback.assignDriver(
        rideRequestId,
        driverId,
        tripId,
      );
    }

    const rideRequest =
      await RideRequest.findByIdAndUpdate(
        rideRequestId,
        {
          assignedDriver:
            driverId,

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
          select:
            DRIVER_FIELDS,
        })
        .populate({
          path: "groupId",
          populate: {
            path:
              "assignedDriver",
            select:
              DRIVER_FIELDS,
          },
        });

    return rideRequest;
  };

/*
|--------------------------------------------------------------------------
| Exports
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

  acceptRideRequest:
    assignDriver,
};