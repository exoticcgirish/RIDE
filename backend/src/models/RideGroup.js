const mongoose = require("mongoose");

const rideGroupSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RideRequest",
      },
    ],

    pickupLocation: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    departureDate: {
      type: Date,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    totalSeats: {
      type: Number,
      default: 0,
    },

    maxSeats: {
      type: Number,
      default: 4,
    },

    status: {
      type: String,
      enum: ["waiting", "ready", "accepted", "completed", "cancelled"],
      default: "waiting",
    },

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

module.exports = mongoose.model("RideGroup", rideGroupSchema);
