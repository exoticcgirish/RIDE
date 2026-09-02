const mongoose = require("mongoose");


const rideRequestSchema = new mongoose.Schema(
  {
   

    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
      required: true,
    },


    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },



    pickupELoc: {
      type: String,
      trim: true,
      default: null,
    },


    pickupPlaceName: {
      type: String,
      trim: true,
      default: null,
    },

    pickupPlaceAddress: {
      type: String,
      trim: true,
      default: null,
    },

  

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * Mappls eLoc
     *
     * This is the current location identifier.
     */

    destinationELoc: {
      type: String,
      trim: true,
      default: null,
    },

    /*
     * Optional Mappls metadata.
     */

    destinationPlaceName: {
      type: String,
      trim: true,
      default: null,
    },

    destinationPlaceAddress: {
      type: String,
      trim: true,
      default: null,
    },

    /*
     * -------------------------------------------------------
     * Departure
     * -------------------------------------------------------
     */

    departureDate: {
      type: Date,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * -------------------------------------------------------
     * Seats
     * -------------------------------------------------------
     *
     * RideGroup currently uses MAX_SEATS = 4.
     */

    seatsRequired: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },

    /*
     * -------------------------------------------------------
     * Notes
     * -------------------------------------------------------
     */

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    /*
     * -------------------------------------------------------
     * Ride Group
     * -------------------------------------------------------
     */

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideGroup",
      default: null,
    },

    /*
     * -------------------------------------------------------
     * Ride Status
     * -------------------------------------------------------
     *
     * waiting
     *   Rider is waiting for compatible riders.
     *
     * grouped
     *   Rider has been placed into a RideGroup.
     *
     * accepted
     *   Driver has accepted the ride/group.
     *
     * cancelled
     *   Rider cancelled the request.
     *
     * completed
     *   Ride has completed.
     */

    status: {
      type: String,

      enum: [
        "waiting",
        "grouped",
        "accepted",
        "cancelled",
        "completed",
      ],

      default: "waiting",
    },

    /*
     * -------------------------------------------------------
     * Assigned Driver
     * -------------------------------------------------------
     */

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    /*
     * -------------------------------------------------------
     * Driver Location
     * -------------------------------------------------------
     *
     * IMPORTANT:
     *
     * This is different from pickup/destination
     * coordinate resolution.
     *
     * Keep this field because it can be used later
     * for tracking the assigned driver's current
     * location.
     */

    driverLocation: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
        default: null,
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },

    /*
     * -------------------------------------------------------
     * Trip
     * -------------------------------------------------------
     */

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| Query Indexes
|--------------------------------------------------------------------------
|
| No pickupPoint/destinationPoint indexes are used currently
| because pickup and destination do not contain coordinates.
|
|--------------------------------------------------------------------------
*/

rideRequestSchema.index({
  rider: 1,
  createdAt: -1,
});

rideRequestSchema.index({
  status: 1,
  departureDate: 1,
  departureTime: 1,
});

rideRequestSchema.index({
  groupId: 1,
});

rideRequestSchema.index({
  assignedDriver: 1,
});

/*
|--------------------------------------------------------------------------
| Export Model
|--------------------------------------------------------------------------
*/

module.exports =
  mongoose.models.RideRequest ||
  mongoose.model(
    "RideRequest",
    rideRequestSchema,
  );