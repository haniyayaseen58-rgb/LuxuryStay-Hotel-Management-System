
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
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
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["guest", "staff", "admin"],
      default: "guest",
    },

    resetOtpHash: {
      type: String,
      default: null,
      select: false,
    },

    resetOtpExpires: {
      type: Date,
      default: null,
      select: false,
    },

    resetOtpVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
