const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    checkInDate: {
      type: Date,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    guestDetails: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      address: {
        type: String,
        required: true,
        trim: true,
      },

      nationality: {
        type: String,
        required: true,
        trim: true,
      },

      documentType: {
        type: String,
        enum: ["cnic", "passport"],
        required: true,
      },

      documentNumber: {
        type: String,
        required: true,
        trim: true,
      },

      documentFront: {
        type: String,
        default: "",
      },

      documentBack: {
        type: String,
        default: "",
      },

      emergencyContact: {
        type: String,
        required: true,
        trim: true,
      },

      vehicleNumber: {
        type: String,
        default: "",
        trim: true,
      },
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "checked-in",
        "checked-out",
        "cancelled",
      ],
      default: "pending",
    },

    totalNights: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank-transfer"],
      default: null,
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    transactionReference: {
      type: String,
      default: "",
      trim: true,
    },

    specialRequests: {
      type: String,
      default: "",
      trim: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },

    checkedOutAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);