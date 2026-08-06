const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["rider"],
      default: "rider",
    },

    phone: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    college: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    emergencyContact: {
      type: String,
      default: "",
    },

    savedLocations: [
      {
        label: {
          type: String,
          default: "",
        },
        address: {
          type: String,
          default: "",
        },
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

module.exports = mongoose.models.Rider || mongoose.model("Rider", riderSchema);
