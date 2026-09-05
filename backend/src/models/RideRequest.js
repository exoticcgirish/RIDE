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

    destinationELoc: {
      type: String,
      trim: true,
      default: null,
    },

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

    departureDate: {
      type: Date,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
      trim: true,
    },

    seatsRequired: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideGroup",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "grouped",
        "accepted",
        "in_progress",
        "cancelled",
        "completed",
      ],
      default: "waiting",
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

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

module.exports =
  mongoose.models.RideRequest ||
  mongoose.model("RideRequest", rideRequestSchema);