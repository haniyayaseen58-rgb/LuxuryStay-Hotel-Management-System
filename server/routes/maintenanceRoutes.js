const express = require("express");

const Maintenance = require("../models/Maintenance");
const Room = require("../models/Room");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("staff", "admin"),
  async (req, res) => {
    try {
      const tasks = await Maintenance.find()
        .populate(
          "room",
          "roomNumber name type floor status isActive"
        )
        .populate("reportedBy", "name email role")
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error("Get Maintenance Tasks Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load maintenance tasks.",
      });
    }
  }
);

router.post(
  "/",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const {
        roomId,
        issueTitle,
        description,
        priority,
      } = req.body;

      if (!roomId || !issueTitle || !description) {
        return res.status(400).json({
          success: false,
          message: "Please provide room, issue title and description.",
        });
      }

      const allowedPriorities = [
        "low",
        "medium",
        "high",
        "urgent",
      ];

      if (
        priority &&
        !allowedPriorities.includes(priority)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid maintenance priority.",
        });
      }

      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found.",
        });
      }

      if (!room.isActive) {
        return res.status(400).json({
          success: false,
          message: "This room is currently inactive.",
        });
      }

      if (room.status === "occupied") {
        return res.status(400).json({
          success: false,
          message:
            "An occupied room cannot be moved to maintenance.",
        });
      }

      const existingTask = await Maintenance.findOne({
        room: room._id,
        status: {
          $in: ["pending", "in-progress"],
        },
      });

      if (existingTask) {
        return res.status(400).json({
          success: false,
          message:
            "This room already has an active maintenance task.",
        });
      }

      const task = await Maintenance.create({
        room: room._id,
        issueTitle: issueTitle.trim(),
        description: description.trim(),
        priority: priority || "medium",
        reportedBy: req.user._id,
      });

      room.status = "maintenance";

      await room.save();

      const populatedTask = await Maintenance.findById(
        task._id
      )
        .populate(
          "room",
          "roomNumber name type floor status isActive"
        )
        .populate("reportedBy", "name email role");

      return res.status(201).json({
        success: true,
        message: "Maintenance issue reported successfully!",
        task: populatedTask,
      });
    } catch (error) {
      console.error("Create Maintenance Task Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to report maintenance issue.",
      });
    }
  }
);

router.patch(
  "/:id/start",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const task = await Maintenance.findById(
        req.params.id
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Maintenance task not found.",
        });
      }

      if (task.status !== "pending") {
        return res.status(400).json({
          success: false,
          message:
            "Only pending maintenance tasks can be started.",
        });
      }

      task.status = "in-progress";

      await task.save();

      const updatedTask = await Maintenance.findById(
        task._id
      )
        .populate(
          "room",
          "roomNumber name type floor status isActive"
        )
        .populate("reportedBy", "name email role");

      return res.status(200).json({
        success: true,
        message: "Maintenance work started successfully!",
        task: updatedTask,
      });
    } catch (error) {
      console.error("Start Maintenance Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to start maintenance work.",
      });
    }
  }
);

router.patch(
  "/:id/complete",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const task = await Maintenance.findById(
        req.params.id
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Maintenance task not found.",
        });
      }

      if (
        task.status !== "pending" &&
        task.status !== "in-progress"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This maintenance task has already been completed.",
        });
      }

      const room = await Room.findById(task.room);

      if (!room) {
        return res.status(404).json({
          success: false,
          message:
            "Room assigned to this maintenance task was not found.",
        });
      }

      task.status = "completed";
      task.completedAt = new Date();

      room.status = "available";

      await task.save();
      await room.save();

      const updatedTask = await Maintenance.findById(
        task._id
      )
        .populate(
          "room",
          "roomNumber name type floor status isActive"
        )
        .populate("reportedBy", "name email role");

      return res.status(200).json({
        success: true,
        message:
          "Maintenance completed and room is now available!",
        task: updatedTask,
      });
    } catch (error) {
      console.error("Complete Maintenance Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to complete maintenance task.",
      });
    }
  }
);

module.exports = router;