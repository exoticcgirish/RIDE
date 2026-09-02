const mongoose = require("mongoose");

const rideGroupSchema = new mongoose.Schema(
  {
    /*
     * -------------------------------------------------------
     * Group Members
     * -------------------------------------------------------
     */

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RideRequest",
        required: true,
      },
    ],

    /*
     * -------------------------------------------------------
     * Pickup
     * -------------------------------------------------------
     */

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
     * Trip Information
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
     * Group Status
     * -------------------------------------------------------
     *
     * waiting
     *   Group is being prepared.
     *
     * ready
     *   Group is available for a driver.
     *
     * accepted
     *   Driver accepted the group.
     *
     * in_progress
     *   Driver entered the correct OTP and ride started.
     *
     * completed
     *   Driver completed the ride.
     *
     * cancelled
     *   Group was cancelled.
     * -------------------------------------------------------
     */

    status: {
      type: String,

      enum: [
        "waiting",
        "ready",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],

      default: "waiting",
    },

    /*
     * -------------------------------------------------------
     * Ride OTP
     * -------------------------------------------------------
     *
     * One OTP belongs to the whole RideGroup.
     *
     * Example:
     *
     * Rider A
     * Rider B
     * Rider C
     * Rider D
     *
     * OTP = 4827
     *
     * Driver enters 4827 once.
     * The entire group ride starts.
     * -------------------------------------------------------
     */

    rideOtp: {
      type: String,
      default: null,
      minlength: 4,
      maxlength: 4,
    },

    /*
     * -------------------------------------------------------
     * Ride Started
     * -------------------------------------------------------
     */

    rideStartedAt: {
      type: Date,
      default: null,
    },

    /*
     * -------------------------------------------------------
     * Ride Completed
     * -------------------------------------------------------
     */

    rideCompletedAt: {
      type: Date,
      default: null,
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
     * Assigned Driver
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
| Query Indexes
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
  mongoose.model("RideGroup", rideGroupSchema);