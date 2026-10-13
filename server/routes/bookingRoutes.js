const express = require("express");

const Booking = require("../models/Booking");
const Room = require("../models/Room");
const upload = require("../middleware/uploadMiddleware");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

const BOOKING_CONFLICT_MESSAGE =
  "This room is already booked for the selected dates. Please choose another room or different dates.";

const ROOM_BUSY_MESSAGE =
  "This room is being booked right now. Please try again in a moment.";

const acquireRoomLock = async (roomId) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const now = new Date();

    const lockedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        $or: [
          { bookingLockUntil: null },
          { bookingLockUntil: { $lte: now } },
        ],
      },
      {
        $set: {
          bookingLockUntil: new Date(now.getTime() + 15000),
        },
      },
      { timestamps: false }
    );

    if (lockedRoom) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return false;
};

const releaseRoomLock = async (roomId) => {
  try {
    await Room.updateOne(
      { _id: roomId },
      { $unset: { bookingLockUntil: 1 } },
      { timestamps: false }
    );
  } catch (error) {
    console.error("Release Room Lock Error:", error);
  }
};

router.get(
  "/availability",
  protect,
  authorizeRoles("guest"),
  async (req, res) => {
    try {
      const {
        checkInDate,
        checkOutDate,
        guests,
      } = req.query;

      if (
        !checkInDate ||
        !checkOutDate ||
        !guests
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Check-in date, check-out date and guests are required.",
        });
      }

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const guestCount = Number(guests);

      if (
        Number.isNaN(checkIn.getTime()) ||
        Number.isNaN(checkOut.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select valid booking dates.",
        });
      }

      if (checkOut <= checkIn) {
        return res.status(400).json({
          success: false,
          message:
            "Check-out date must be after check-in date.",
        });
      }

      if (
        !Number.isInteger(guestCount) ||
        guestCount < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid number of guests.",
        });
      }

      const rooms = await Room.find({
        isActive: true,
        capacity: {
          $gte: guestCount,
        },
        status: {
          $nin: [
            "maintenance",
            "cleaning",
          ],
        },
      }).sort({
        roomNumber: 1,
      });

      const roomIds = rooms.map(
        (room) => room._id
      );

      const conflictingBookings =
        await Booking.find({
          room: {
            $in: roomIds,
          },
          bookingStatus: {
            $in: [
              "pending",
              "confirmed",
              "checked-in",
            ],
          },
          checkInDate: {
            $lt: checkOut,
          },
          checkOutDate: {
            $gt: checkIn,
          },
        }).select("room");

      const unavailableRoomIds = new Set(
        conflictingBookings.map(
          (booking) =>
            String(booking.room)
        )
      );

      const availableRooms = rooms.filter(
        (room) =>
          !unavailableRoomIds.has(
            String(room._id)
          )
      );

      return res.status(200).json({
        success: true,
        count: availableRooms.length,
        rooms: availableRooms,
        search: {
          checkInDate,
          checkOutDate,
          guests: guestCount,
        },
      });
    } catch (error) {
      console.error(
        "Room Availability Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to check room availability.",
      });
    }
  }
);
router.post(
  "/",
  protect,
  authorizeRoles("guest"),
  upload.fields([
    {
      name: "documentFront",
      maxCount: 1,
    },
    {
      name: "documentBack",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
  const {
  roomId,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  specialRequests,
} = req.body;

let guestDetails = req.body.guestDetails;

if (typeof guestDetails === "string") {
  try {
    guestDetails = JSON.parse(guestDetails);
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid guest details.",
    });
  }
}
      if (
        !roomId ||
        !checkInDate ||
        !checkOutDate ||
        !numberOfGuests ||
        !guestDetails
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide all required booking details.",
        });
      }

 const {
  fullName,
  phone,
  email,
  address,
  nationality,
  documentType,
  documentNumber,
  emergencyContact,
  vehicleNumber,
} = guestDetails;
      if (
        !fullName ||
        !phone ||
        !email ||
        !address ||
        !nationality ||
        !documentType ||
        !documentNumber ||
        !emergencyContact
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please complete all required guest details.",
        });
      }

      if (
        !["cnic", "passport"].includes(
          documentType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid identity document type.",
        });
      }

      const room = await Room.findById(
        roomId
      );

      if (!room || !room.isActive) {
        return res.status(404).json({
          success: false,
          message:
            "Selected room is not available.",
        });
      }

      const checkIn = new Date(
        checkInDate
      );

      const checkOut = new Date(
        checkOutDate
      );

      if (
        Number.isNaN(
          checkIn.getTime()
        ) ||
        Number.isNaN(
          checkOut.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select valid booking dates.",
        });
      }

      if (checkOut <= checkIn) {
        return res.status(400).json({
          success: false,
          message:
            "Check-out date must be after check-in date.",
        });
      }

      const guests = Number(
        numberOfGuests
      );

      if (
        !Number.isInteger(guests) ||
        guests < 1 ||
        guests > room.capacity
      ) {
        return res.status(400).json({
          success: false,
          message: `This room allows a maximum of ${room.capacity} guests.`,
        });
      }

      const millisecondsPerDay =
        1000 * 60 * 60 * 24;

      const totalNights = Math.ceil(
        (checkOut.getTime() -
          checkIn.getTime()) /
          millisecondsPerDay
      );

      const pricePerNight =
        room.pricePerNight;

      const totalAmount =
        totalNights *
        pricePerNight;

      const lockAcquired =
        await acquireRoomLock(room._id);

      if (!lockAcquired) {
        return res.status(503).json({
          success: false,
          message: ROOM_BUSY_MESSAGE,
        });
      }

      let booking;

      try {
        const conflictingBooking =
          await Booking.findOne({
            room: room._id,
            bookingStatus: {
              $in: [
                "pending",
                "confirmed",
                "checked-in",
              ],
            },
            checkInDate: {
              $lt: checkOut,
            },
            checkOutDate: {
              $gt: checkIn,
            },
          });

        if (conflictingBooking) {
          return res.status(409).json({
            success: false,
            message: BOOKING_CONFLICT_MESSAGE,
          });
        }

        booking =
        await Booking.create({
          guest: req.user._id,
          room: room._id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guests,
        guestDetails: {
  fullName: fullName.trim(),
  phone: phone.trim(),
  email: email.toLowerCase().trim(),
  address: address.trim(),
  nationality: nationality.trim(),
  documentType,
  documentNumber: documentNumber.trim(),
  documentFront: req.files?.documentFront?.[0]
    ? req.files.documentFront[0].path
    : "",
  documentBack: req.files?.documentBack?.[0]
    ? req.files.documentBack[0].path
    : "",
  emergencyContact: emergencyContact.trim(),
  vehicleNumber: vehicleNumber?.trim() || "",
},
          totalNights,
          pricePerNight,
          totalAmount,
          specialRequests: specialRequests?.trim() || "",
        });
      } finally {
        await releaseRoomLock(room._id);
      }

        const populatedBooking =
          await Booking.findById(
            booking._id
          )
            .populate(
              "room",
              "roomNumber name type pricePerNight capacity bedType floor"
            )
            .populate(
              "guest",
              "name email"
            );

        return res.status(201).json({
          success: true,
          message:
            "Booking request submitted successfully. Verification is pending.",
          booking: populatedBooking,
        });
    } catch (error) {
      console.error(
        "Create Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create booking.",
      });
    }
  }
);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const bookings =
        await Booking.find()
          .populate(
            "guest",
            "name email role"
          )
          .populate(
            "room",
            "roomNumber name type pricePerNight capacity bedType floor status"
          )
          .populate(
            "verifiedBy",
            "name email role"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count:
          bookings.length,
        bookings,
      });
    } catch (error) {
      console.error(
        "Admin Get Bookings Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load bookings.",
      });
    }
  }
);

router.patch(
  "/admin/:id/confirm",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      if (
        booking.bookingStatus !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending bookings can be confirmed.",
        });
      }

      const lockAcquired =
        await acquireRoomLock(booking.room);

      if (!lockAcquired) {
        return res.status(503).json({
          success: false,
          message: ROOM_BUSY_MESSAGE,
        });
      }

      try {
        const conflict =
          await Booking.findOne({
            _id: {
              $ne: booking._id,
            },
            room:
              booking.room,
            bookingStatus: {
              $in: [
                "confirmed",
                "checked-in",
              ],
            },
            checkInDate: {
              $lt:
                booking.checkOutDate,
            },
            checkOutDate: {
              $gt:
                booking.checkInDate,
            },
          });

        if (conflict) {
          return res.status(409).json({
            success: false,
            message: BOOKING_CONFLICT_MESSAGE,
          });
        }

        booking.bookingStatus =
          "confirmed";

        booking.verificationStatus =
          "verified";

        booking.verifiedBy =
          req.user._id;

        await booking.save();
      } finally {
        await releaseRoomLock(booking.room);
      }

      const updatedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            "guest",
            "name email role"
          )
          .populate(
            "room",
            "roomNumber name type pricePerNight capacity bedType floor status"
          )
          .populate(
            "verifiedBy",
            "name email role"
          );

      return res.status(200).json({
        success: true,
        message:
          "Booking confirmed successfully!",
        booking:
          updatedBooking,
      });
    } catch (error) {
      console.error(
        "Confirm Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to confirm booking.",
      });
    }
  }
);

router.patch(
  "/admin/:id/reject",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      if (
        booking.bookingStatus !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only pending bookings can be rejected.",
        });
      }

      booking.bookingStatus =
        "rejected";

      booking.verificationStatus =
        "rejected";

      booking.verifiedBy =
        req.user._id;

      await booking.save();

      const updatedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            "guest",
            "name email role"
          )
          .populate(
            "room",
            "roomNumber name type pricePerNight capacity bedType floor status"
          )
          .populate(
            "verifiedBy",
            "name email role"
          );

      return res.status(200).json({
        success: true,
        message:
          "Booking rejected successfully.",
        booking:
          updatedBooking,
      });
    } catch (error) {
      console.error(
        "Reject Booking Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reject booking.",
      });
    }
  }
);

router.get(
  "/staff",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const bookings =
        await Booking.find({
          bookingStatus: {
            $in: [
              "confirmed",
              "checked-in",
              "checked-out",
            ],
          },
        })
          .populate(
            "guest",
            "name email role"
          )
          .populate(
            "room",
            "roomNumber name type pricePerNight capacity bedType floor status"
          )
          .populate(
            "verifiedBy",
            "name email role"
          )
          .sort({
            checkInDate: 1,
          });

      return res.status(200).json({
        success: true,
        count:
          bookings.length,
        bookings,
      });
    } catch (error) {
      console.error(
        "Staff Get Bookings Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load staff bookings.",
      });
    }
  }
);

router.patch(
  "/staff/:id/check-in",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const booking =
        await Booking.findById(
          req.params.id
        );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message:
            "Booking not found.",
        });
      }

      if (
        booking.bookingStatus !==
        "confirmed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only confirmed bookings can be checked in.",
        });
      }

      if (
        booking.verificationStatus !==
        "verified"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Guest verification must be completed before check-in.",
        });
      }

      const room =
        await Room.findById(
          booking.room
        );

      if (!room) {
        return res.status(404).json({
          success: false,
          message:
            "Room assigned to this booking was not found.",
        });
      }

      if (!room.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "This room is currently inactive.",
        });
      }

      if (
        room.status ===
        "maintenance"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This room is currently under maintenance.",
        });
      }

      booking.bookingStatus =
        "checked-in";

      booking.checkedInAt =
        new Date();

      room.status =
        "occupied";

      await booking.save();
      await room.save();

      const updatedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            "guest",
            "name email role"
          )
          .populate(
            "room",
            "roomNumber name type pricePerNight capacity bedType floor status"
          )
          .populate(
            "verifiedBy",
            "name email role"
          );

      return res.status(200).json({
        success: true,
        message:
          "Guest checked in successfully!",
        booking:
          updatedBooking,
      });
    } catch (error) {
      console.error(
        "Staff Check-In Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to check in guest.",
      });
    }
  }
);

router.patch(
  "/staff/:id/check-out",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      if (booking.bookingStatus !== "checked-in") {
        return res.status(400).json({
          success: false,
          message: "Only checked-in guests can be checked out.",
        });
      }

      const room = await Room.findById(booking.room);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room assigned to this booking was not found.",
        });
      }

      booking.bookingStatus = "checked-out";
      booking.checkedOutAt = new Date();

      room.status = "cleaning";

      await booking.save();
      await room.save();

      const updatedBooking = await Booking.findById(booking._id)
        .populate("guest", "name email role")
        .populate(
          "room",
          "roomNumber name type pricePerNight capacity bedType floor status"
        )
        .populate("verifiedBy", "name email role");

      return res.status(200).json({
        success: true,
        message: "Guest checked out successfully!",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error("Staff Check-Out Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to check out guest.",
      });
    }
  }
);
router.get(
  "/my-bookings",
  protect,
  authorizeRoles("guest"),
  async (req, res) => {
    try {
      const bookings = await Booking.find({
        guest: req.user._id,
      })
        .populate(
          "room",
          "roomNumber name type pricePerNight capacity bedType floor status"
        )
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: bookings.length,
        bookings,
      });
    } catch (error) {
      console.error("Guest My Bookings Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load your bookings.",
      });
    }
  }
);
router.get(
  "/admin/finance",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const bookings = await Booking.find({
        bookingStatus: {
          $in: [
            "confirmed",
            "checked-in",
            "checked-out",
          ],
        },
      })
        .populate(
          "guest",
          "name email role"
        )
        .populate(
          "room",
          "roomNumber name type pricePerNight"
        )
        .sort({
          createdAt: -1,
        });

      const billingRecords = bookings.map(
        (booking) => {
          const amountPaid =
            booking.amountPaid || 0;

          const remainingAmount = Math.max(
            booking.totalAmount - amountPaid,
            0
          );

          return {
            ...booking.toObject(),
            amountPaid,
            remainingAmount,
            paymentStatus:
              booking.paymentStatus || "unpaid",
          };
        }
      );

      const totalRevenue = billingRecords.reduce(
        (total, booking) =>
          total + booking.amountPaid,
        0
      );

      const totalOutstanding =
        billingRecords.reduce(
          (total, booking) =>
            total + booking.remainingAmount,
          0
        );

      const totalBilled = billingRecords.reduce(
        (total, booking) =>
          total + booking.totalAmount,
        0
      );

      return res.status(200).json({
        success: true,
        count: billingRecords.length,
        summary: {
          totalBilled,
          totalRevenue,
          totalOutstanding,
          paidBookings: billingRecords.filter(
            (booking) =>
              booking.paymentStatus === "paid"
          ).length,
          partialBookings: billingRecords.filter(
            (booking) =>
              booking.paymentStatus === "partial"
          ).length,
          unpaidBookings: billingRecords.filter(
            (booking) =>
              booking.paymentStatus === "unpaid"
          ).length,
        },
        bookings: billingRecords,
      });
    } catch (error) {
      console.error(
        "Admin Finance Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load finance records.",
      });
    }
  }
);

router.patch(
  "/admin/:id/payment",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        amount,
        paymentMethod,
        transactionReference,
      } = req.body;

      const paymentAmount = Number(amount);

      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid payment amount.",
        });
      }

      if (
        ![
          "cash",
          "card",
          "bank-transfer",
        ].includes(paymentMethod)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid payment method.",
        });
      }

      if (
        paymentMethod !== "cash" &&
        !transactionReference?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Transaction reference is required for card and bank transfer payments.",
        });
      }

      const booking = await Booking.findById(
        req.params.id
      );

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      if (
        ![
          "confirmed",
          "checked-in",
          "checked-out",
        ].includes(booking.bookingStatus)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment cannot be recorded for this booking.",
        });
      }

      const currentPaid =
        booking.amountPaid || 0;

      const remainingAmount =
        booking.totalAmount - currentPaid;

      if (paymentAmount > remainingAmount) {
        return res.status(400).json({
          success: false,
          message: `Payment cannot exceed the remaining balance of Rs. ${remainingAmount.toLocaleString()}.`,
        });
      }

      booking.amountPaid =
        currentPaid + paymentAmount;

      booking.paymentMethod =
        paymentMethod;

      booking.paymentDate =
        new Date();

      booking.transactionReference =
        transactionReference?.trim() || "";

      if (
        booking.amountPaid >=
        booking.totalAmount
      ) {
        booking.paymentStatus = "paid";
      } else if (booking.amountPaid > 0) {
        booking.paymentStatus = "partial";
      } else {
        booking.paymentStatus = "unpaid";
      }

      await booking.save();

      const updatedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            "guest",
            "name email role"
          )
          .populate(
            "room",
            "roomNumber name type pricePerNight"
          );

      return res.status(200).json({
        success: true,
        message:
          booking.paymentStatus === "paid"
            ? "Payment completed successfully!"
            : "Partial payment recorded successfully!",
        booking: {
          ...updatedBooking.toObject(),
          remainingAmount: Math.max(
            updatedBooking.totalAmount -
              updatedBooking.amountPaid,
            0
          ),
        },
      });
    } catch (error) {
      console.error(
        "Admin Payment Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to record payment.",
      });
    }
  }
);

module.exports = router;

