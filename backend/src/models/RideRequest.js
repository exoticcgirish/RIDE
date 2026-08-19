const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider", // Change to "User" if your actual model is User
      required: true,
    },

    pickupLocation: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    pickupCoordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },

    destinationCoordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },

    departureDate: {
      type: Date,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    seatsRequired: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RideGroup",
      default: null,
    },

    status: {
      type: String,
      enum: ["waiting", "accepted", "cancelled", "completed"],
      default: "waiting",
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.RideRequest ||
  mongoose.model("RideRequest", rideRequestSchema);