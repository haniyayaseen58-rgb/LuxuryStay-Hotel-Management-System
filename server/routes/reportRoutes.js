const express = require("express");

const Booking = require("../models/Booking");
const Room = require("../models/Room");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate(
          "guest",
          "name email role"
        )
        .populate(
          "room",
          "roomNumber name type pricePerNight status"
        )
        .sort({
          createdAt: -1,
        });

      const rooms = await Room.find();

      const billableBookings = bookings.filter((booking) =>
        [
          "confirmed",
          "checked-in",
          "checked-out",
        ].includes(booking.bookingStatus)
      );

      const totalRevenue = billableBookings.reduce(
        (total, booking) =>
          total + Number(booking.amountPaid || 0),
        0
      );

      const totalBilled = billableBookings.reduce(
        (total, booking) =>
          total + Number(booking.totalAmount || 0),
        0
      );

      const totalOutstanding = billableBookings.reduce(
        (total, booking) => {
          const remaining = Math.max(
            Number(booking.totalAmount || 0) -
              Number(booking.amountPaid || 0),
            0
          );

          return total + remaining;
        },
        0
      );

      const activeRooms = rooms.filter(
        (room) => room.isActive
      );

      const occupiedRooms = activeRooms.filter(
        (room) => room.status === "occupied"
      ).length;

      const availableRooms = activeRooms.filter(
        (room) => room.status === "available"
      ).length;

      const serviceRooms = activeRooms.filter(
        (room) =>
          room.status === "cleaning" ||
          room.status === "maintenance"
      ).length;

      const occupancyRate =
        activeRooms.length > 0
          ? Math.round(
              (occupiedRooms / activeRooms.length) * 100
            )
          : 0;

      const statusBreakdown = {
        pending: bookings.filter(
          (booking) =>
            booking.bookingStatus === "pending"
        ).length,
        confirmed: bookings.filter(
          (booking) =>
            booking.bookingStatus === "confirmed"
        ).length,
        checkedIn: bookings.filter(
          (booking) =>
            booking.bookingStatus === "checked-in"
        ).length,
        checkedOut: bookings.filter(
          (booking) =>
            booking.bookingStatus === "checked-out"
        ).length,
        rejected: bookings.filter(
          (booking) =>
            booking.bookingStatus === "rejected"
        ).length,
        cancelled: bookings.filter(
          (booking) =>
            booking.bookingStatus === "cancelled"
        ).length,
      };

      const paymentBreakdown = {
        paid: billableBookings.filter(
          (booking) =>
            booking.paymentStatus === "paid"
        ).length,
        partial: billableBookings.filter(
          (booking) =>
            booking.paymentStatus === "partial"
        ).length,
        unpaid: billableBookings.filter(
          (booking) =>
            booking.paymentStatus === "unpaid"
        ).length,
      };

      const monthMap = new Map();

      bookings.forEach((booking) => {
        const date = new Date(booking.createdAt);

        if (Number.isNaN(date.getTime())) {
          return;
        }

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthMap.has(key)) {
          monthMap.set(key, {
            key,
            label: date.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }),
            bookings: 0,
            revenue: 0,
          });
        }

        const record = monthMap.get(key);

        record.bookings += 1;

        if (
          [
            "confirmed",
            "checked-in",
            "checked-out",
          ].includes(booking.bookingStatus)
        ) {
          record.revenue += Number(
            booking.amountPaid || 0
          );
        }
      });

      const monthlyPerformance = Array.from(
        monthMap.values()
      )
        .sort((a, b) =>
          a.key.localeCompare(b.key)
        )
        .slice(-6);

      const roomPerformanceMap = new Map();

      billableBookings.forEach((booking) => {
        if (!booking.room) {
          return;
        }

        const roomId = String(booking.room._id);

        if (!roomPerformanceMap.has(roomId)) {
          roomPerformanceMap.set(roomId, {
            roomId,
            roomNumber:
              booking.room.roomNumber || "N/A",
            roomName:
              booking.room.name || "Room",
            roomType:
              booking.room.type || "Standard",
            bookings: 0,
            revenue: 0,
          });
        }

        const roomRecord =
          roomPerformanceMap.get(roomId);

        roomRecord.bookings += 1;
        roomRecord.revenue += Number(
          booking.amountPaid || 0
        );
      });

      const roomPerformance = Array.from(
        roomPerformanceMap.values()
      ).sort(
        (a, b) => b.revenue - a.revenue
      );

      const recentActivity = bookings
        .slice(0, 6)
        .map((booking) => ({
          id: booking._id,
          guestName:
            booking.guestDetails?.fullName ||
            booking.guest?.name ||
            "Guest",
          roomNumber:
            booking.room?.roomNumber || "N/A",
          bookingStatus:
            booking.bookingStatus,
          paymentStatus:
            booking.paymentStatus || "unpaid",
          totalAmount:
            booking.totalAmount || 0,
          amountPaid:
            booking.amountPaid || 0,
          createdAt:
            booking.createdAt,
        }));

      return res.status(200).json({
        success: true,
        generatedAt: new Date(),
        summary: {
          totalBookings: bookings.length,
          billableBookings:
            billableBookings.length,
          totalRooms: activeRooms.length,
          occupiedRooms,
          availableRooms,
          serviceRooms,
          occupancyRate,
          totalBilled,
          totalRevenue,
          totalOutstanding,
        },
        statusBreakdown,
        paymentBreakdown,
        monthlyPerformance,
        roomPerformance,
        recentActivity,
      });
    } catch (error) {
      console.error(
        "Admin Reports Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to generate admin reports.",
      });
    }
  }
);

module.exports = router;