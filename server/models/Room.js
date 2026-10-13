const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Serene Room", "Signature Suite", "Royal Residence"],
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    bedType: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "available",
        "occupied",
        "reserved",
        "cleaning",
        "maintenance",
      ],
      default: "available",
    },
    floor: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bookingLockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);