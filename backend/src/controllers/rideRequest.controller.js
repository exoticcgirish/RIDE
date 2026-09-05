const RideRequest = require("../models/RideRequest.js");

const {
  createRideRequest,
  getMyRideRequests,
  getRideRequestById,
  updateRideRequest,
  cancelRideRequest,
  deleteRideRequest,
  searchRideRequests,
  assignDriver,
} = require("../services/rideRequest.service.js");

const {
  createRideRequestSchema,
  updateRideRequestSchema,
} = require("../validators/rideRequest.validator.js");

/*
|--------------------------------------------------------------------------
| CREATE RIDE REQUEST
|--------------------------------------------------------------------------
*/

exports.create = async (req, res) => {
  try {
    console.log("[rideRequest] create called by:", req.user && req.user.id);

    console.log("[rideRequest] payload:", req.body);

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE REQUEST
    |--------------------------------------------------------------------------
    */

    const { error } = createRideRequestSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE RIDE
    |--------------------------------------------------------------------------
    |
    | RabbitMQ ride_created event is already published
    | inside createRideRequest().
    |
    */

    const result = await createRideRequest(req.user.id, req.body);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message: "Ride request created successfully.",
      data: result.rideRequest || null,
      group: result.group || null,
    });
  } catch (err) {
    console.error("Create ride error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create ride request.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET DRIVER LOCATION
|--------------------------------------------------------------------------
*/

exports.getDriverLocation = async (req, res) => {
  try {
    const { rideRequestId } = req.params;

    if (!rideRequestId) {
      return res.status(400).json({
        success: false,
        message: "Ride request ID is required.",
      });
    }

    const rideRequest = await RideRequest.findById(rideRequestId).select(
      "driverLocation assignedDriver",
    );

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    if (!rideRequest.assignedDriver) {
      return res.status(404).json({
        success: false,
        message: "No driver assigned to this ride.",
      });
    }

    const location = rideRequest.driverLocation;

    if (
      !location ||
      location.latitude === null ||
      location.latitude === undefined ||
      location.longitude === null ||
      location.longitude === undefined
    ) {
      return res.status(404).json({
        success: false,
        message: "Driver location not available.",
      });
    }

    return res.status(200).json({
      success: true,
      driverLocation: location,
    });
  } catch (error) {
    console.error("Get driver location error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get driver location.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY RIDE REQUESTS
|--------------------------------------------------------------------------
*/

exports.getMine = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const requests = await getMyRideRequests(req.user.id);

    const safeRequests = Array.isArray(requests) ? requests : [];

    return res.status(200).json({
      success: true,
      count: safeRequests.length,
      data: safeRequests,
    });
  } catch (err) {
    console.error("Get Ride Requests Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to get ride requests.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET RIDE REQUEST BY ID
|--------------------------------------------------------------------------
*/

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Ride request ID is required.",
      });
    }

    const rideRequest = await getRideRequestById(id);

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: rideRequest,
    });
  } catch (err) {
    console.error("Get ride request error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to get ride request.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE RIDE REQUEST
|--------------------------------------------------------------------------
*/

exports.update = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { error } = updateRideRequestSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const rideRequest = await updateRideRequest(
      req.params.id,
      req.body,
      req.user.id,
    );

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride request updated successfully.",
      data: rideRequest,
    });
  } catch (err) {
    console.error("Update ride error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update ride request.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CANCEL RIDE REQUEST
|--------------------------------------------------------------------------
*/

exports.cancel = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const rideRequest = await cancelRideRequest(req.params.id, req.user.id);

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride request cancelled successfully.",
      data: rideRequest,
    });
  } catch (err) {
    console.error("Cancel ride error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to cancel ride request.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE RIDE REQUEST
|--------------------------------------------------------------------------
*/

exports.remove = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const rideRequest = await deleteRideRequest(req.params.id, req.user.id);

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ride request deleted successfully.",
    });
  } catch (err) {
    console.error("Delete ride error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete ride request.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SEARCH RIDE REQUESTS
|--------------------------------------------------------------------------
*/

exports.search = async (req, res) => {
  try {
    const { pickupLocation, destination, departureDate } = req.query;

    const requests = await searchRideRequests(
      pickupLocation,
      destination,
      departureDate,
    );

    const safeRequests = Array.isArray(requests) ? requests : [];

    return res.status(200).json({
      success: true,
      count: safeRequests.length,
      data: safeRequests,
    });
  } catch (err) {
    console.error("Search ride requests error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to search ride requests.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| ACCEPT / ASSIGN DRIVER
|--------------------------------------------------------------------------
*/

exports.accept = async (req, res) => {
  try {
    const { driverId, tripId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "driverId is required.",
      });
    }

    const rideRequest = await assignDriver(
      req.params.id,
      driverId,
      tripId || null,
    );

    if (!rideRequest) {
      return res.status(404).json({
        success: false,
        message: "Ride request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver assigned successfully.",
      data: rideRequest,
    });
  } catch (err) {
    console.error("Accept ride error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to assign driver.",
    });
  }
};
