const express = require("express");

const Feedback = require("../models/Feedback");
const Booking = require("../models/Booking");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("guest"),
  async (req, res) => {
    try {
      const {
        bookingId,
        rating,
        title,
        message,
        cleanlinessRating,
        serviceRating,
        roomRating,
      } = req.body;

      if (!bookingId || !rating || !message?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Booking, rating and feedback message are required.",
        });
      }

      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5.",
        });
      }

      const booking = await Booking.findOne({
        _id: bookingId,
        guest: req.user._id,
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      if (booking.bookingStatus !== "checked-out") {
        return res.status(400).json({
          success: false,
          message:
            "Feedback can only be submitted after check-out.",
        });
      }

      const existingFeedback = await Feedback.findOne({
        booking: booking._id,
      });

      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message:
            "Feedback has already been submitted for this stay.",
        });
      }

      const optionalRatings = {
        cleanlinessRating,
        serviceRating,
        roomRating,
      };

      for (const [key, value] of Object.entries(
        optionalRatings
      )) {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          const numericValue = Number(value);

          if (
            !Number.isInteger(numericValue) ||
            numericValue < 1 ||
            numericValue > 5
          ) {
            return res.status(400).json({
              success: false,
              message: `${key} must be between 1 and 5.`,
            });
          }
        }
      }

      const feedback = await Feedback.create({
        guest: req.user._id,
        booking: booking._id,
        room: booking.room,
        rating: numericRating,
        title: title?.trim() || "",
        message: message.trim(),
        cleanlinessRating:
          cleanlinessRating === undefined ||
          cleanlinessRating === null ||
          cleanlinessRating === ""
            ? null
            : Number(cleanlinessRating),
        serviceRating:
          serviceRating === undefined ||
          serviceRating === null ||
          serviceRating === ""
            ? null
            : Number(serviceRating),
        roomRating:
          roomRating === undefined ||
          roomRating === null ||
          roomRating === ""
            ? null
            : Number(roomRating),
      });

      const populatedFeedback =
        await Feedback.findById(feedback._id)
          .populate("guest", "name email")
          .populate(
            "room",
            "roomNumber name type"
          )
          .populate(
            "booking",
            "checkInDate checkOutDate totalAmount bookingStatus"
          );

      return res.status(201).json({
        success: true,
        message:
          "Thank you. Your feedback has been submitted.",
        feedback: populatedFeedback,
      });
    } catch (error) {
      console.error(
        "Submit Feedback Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to submit feedback.",
      });
    }
  }
);

router.get(
  "/my",
  protect,
  authorizeRoles("guest"),
  async (req, res) => {
    try {
      const feedback = await Feedback.find({
        guest: req.user._id,
      })
        .populate(
          "room",
          "roomNumber name type"
        )
        .populate(
          "booking",
          "checkInDate checkOutDate totalAmount bookingStatus"
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        feedback,
      });
    } catch (error) {
      console.error(
        "Guest Feedback Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load feedback.",
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
      const feedback = await Feedback.find()
        .populate("guest", "name email")
        .populate(
          "room",
          "roomNumber name type"
        )
        .populate(
          "booking",
          "checkInDate checkOutDate totalAmount bookingStatus"
        )
        .sort({ createdAt: -1 });

      const totalFeedback = feedback.length;

      const averageRating =
        totalFeedback > 0
          ? Number(
              (
                feedback.reduce(
                  (total, item) =>
                    total + Number(item.rating || 0),
                  0
                ) / totalFeedback
              ).toFixed(1)
            )
          : 0;

      const reviewed = feedback.filter(
        (item) => item.status === "reviewed"
      ).length;

      const newFeedback = feedback.filter(
        (item) => item.status === "new"
      ).length;

      const fiveStar = feedback.filter(
        (item) => item.rating === 5
      ).length;

      const ratingBreakdown = [5, 4, 3, 2, 1].map(
        (rating) => ({
          rating,
          count: feedback.filter(
            (item) => item.rating === rating
          ).length,
        })
      );

      return res.status(200).json({
        success: true,
        summary: {
          totalFeedback,
          averageRating,
          reviewed,
          newFeedback,
          fiveStar,
        },
        ratingBreakdown,
        feedback,
      });
    } catch (error) {
      console.error(
        "Admin Feedback Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load guest feedback.",
      });
    }
  }
);

router.patch(
  "/admin/:id/review",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const feedback = await Feedback.findById(
        req.params.id
      );

      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found.",
        });
      }

      feedback.status = "reviewed";

      await feedback.save();

      return res.status(200).json({
        success: true,
        message: "Feedback marked as reviewed.",
        feedback,
      });
    } catch (error) {
      console.error(
        "Review Feedback Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update feedback status.",
      });
    }
  }
);

module.exports = router;