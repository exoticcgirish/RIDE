const mongoose = require("mongoose");


const rideGroupSchema = new mongoose.Schema(
  {

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RideRequest",
        required: true,
      },
    ],



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

    /*
     * -------------------------------------------------------
     * Destination
     * -------------------------------------------------------
     */

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    destinationELoc: {
      type: String,
      trim: true,
      default: null,
    },

    /*
     * -------------------------------------------------------
     * Trip information
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
     */

    totalSeats: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },

    maxSeats: {
      type: Number,
      default: 4,
      min: 1,
      max: 4,
    },

    /*
     * -------------------------------------------------------
     * Group status
     * -------------------------------------------------------
     */

    status: {
      type: String,

      enum: [
        "waiting",
        "ready",
        "accepted",
        "completed",
        "cancelled",
      ],

      default: "waiting",
    },

    /*
     * -------------------------------------------------------
     * Assigned driver
     * -------------------------------------------------------
     */

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Driver",

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| Query indexes
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| There are NO GeoJSON / 2dsphere indexes anymore.
|
|--------------------------------------------------------------------------
*/

rideGroupSchema.index({
  status: 1,
  departureDate: 1,
  departureTime: 1,
});

rideGroupSchema.index({
  assignedDriver: 1,
});

rideGroupSchema.index({
  members: 1,
});

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports =
  mongoose.models.RideGroup ||
  mongoose.model(
    "RideGroup",
    rideGroupSchema,
  );