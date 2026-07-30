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
      enum: ["rider"],
      default: "rider",
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

module.exports = mongoose.models.Rider || mongoose.model("Rider", riderSchema);