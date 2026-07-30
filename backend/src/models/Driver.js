const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["driver"],
      default: "driver",
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

module.exports = mongoose.models.Driver || mongoose.model("Driver", driverSchema);
