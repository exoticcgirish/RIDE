const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    vehicleName: {
      type: String,
      default: "",
    },

    vehicleNumber: {
      type: String,
      default: "",
    },

    vehicleColor: {
      type: String,
      default: "",
    },

    drivingLicense: {
      type: String,
      default: "",
    },

    totalSeats: {
      type: Number,
      default: 4,
    },

    role: {
      type: String,
      default: "driver",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectReason: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },

    vehicleType: {
      type: String,
      enum: ["Auto", "Car", "Bike"],
      required: true,
    },

    vehicleModel: {
      type: String,
      default: "",
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },

    vehicleColor: {
      type: String,
      default: "",
    },

    vehiclePhoto: {
      type: String,
      default: "",
    },

    rcNumber: {
      type: String,
      default: "",
    },

    rcPhoto: {
      type: String,
      default: "",
    },

    licenseNumber: {
      type: String,
      required: true,
    },

    licensePhoto: {
      type: String,
      default: "",
    },

    aadhaarNumber: {
      type: String,
      default: "",
    },

    aadhaarPhoto: {
      type: String,
      default: "",
    },

    experience: {
      type: Number,
      default: 0,
    },

    collegeName: {
      type: String,
      default: "",
    },

    availableSeats: {
      type: Number,
      default: 4,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Driver || mongoose.model("Driver", driverSchema);
