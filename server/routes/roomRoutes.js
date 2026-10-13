const express = require("express");

const Room = require("../models/Room");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/guest",
  protect,
  authorizeRoles("guest"),
  async (req, res) => {
    try {
      const rooms = await Room.find({
        isActive: true,
      })
        .select(
          "roomNumber name type pricePerNight capacity bedType floor status"
        )
        .sort({
          pricePerNight: 1,
          roomNumber: 1,
        });

      return res.status(200).json({
        success: true,
        count: rooms.length,
        rooms,
      });
    } catch (error) {
      console.error("Guest Rooms Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load rooms.",
      });
    }
  }
);

router.get(
  "/",
  protect,
  authorizeRoles("admin", "staff"),
  async (req, res) => {
    try {
      const rooms = await Room.find().sort({
        floor: 1,
        roomNumber: 1,
      });

      return res.status(200).json({
        success: true,
        count: rooms.length,
        rooms,
      });
    } catch (error) {
      console.error("Get Rooms Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load rooms.",
      });
    }
  }
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        roomNumber,
        name,
        type,
        pricePerNight,
        capacity,
        bedType,
        floor,
        status,
      } = req.body;

      if (
        !roomNumber ||
        !name ||
        !type ||
        pricePerNight === undefined ||
        capacity === undefined ||
        !bedType ||
        floor === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required room details.",
        });
      }

      const existingRoom = await Room.findOne({
        roomNumber: roomNumber.trim(),
      });

      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: "This room number already exists.",
        });
      }

      const room = await Room.create({
        roomNumber: roomNumber.trim(),
        name: name.trim(),
        type,
        pricePerNight,
        capacity,
        bedType: bedType.trim(),
        floor,
        status: status || "available",
      });

      return res.status(201).json({
        success: true,
        message: "Room added successfully!",
        room,
      });
    } catch (error) {
      console.error("Create Room Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create room.",
      });
    }
  }
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found.",
        });
      }

      const {
        roomNumber,
        name,
        type,
        pricePerNight,
        capacity,
        bedType,
        floor,
        status,
        isActive,
      } = req.body;

      if (
        roomNumber &&
        roomNumber.trim() !== room.roomNumber
      ) {
        const existingRoom = await Room.findOne({
          roomNumber: roomNumber.trim(),
          _id: { $ne: room._id },
        });

        if (existingRoom) {
          return res.status(400).json({
            success: false,
            message: "This room number already exists.",
          });
        }
      }

      if (roomNumber !== undefined) {
        room.roomNumber = roomNumber.trim();
      }

      if (name !== undefined) {
        room.name = name.trim();
      }

      if (type !== undefined) {
        room.type = type;
      }

      if (pricePerNight !== undefined) {
        room.pricePerNight = pricePerNight;
      }

      if (capacity !== undefined) {
        room.capacity = capacity;
      }

      if (bedType !== undefined) {
        room.bedType = bedType.trim();
      }

      if (floor !== undefined) {
        room.floor = floor;
      }

      if (status !== undefined) {
        room.status = status;
      }

      if (isActive !== undefined) {
        room.isActive = isActive;
      }

      await room.save();

      return res.status(200).json({
        success: true,
        message: "Room updated successfully!",
        room,
      });
    } catch (error) {
      console.error("Update Room Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update room.",
      });
    }
  }
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "available",
        "occupied",
        "reserved",
        "cleaning",
        "maintenance",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid room status.",
        });
      }

      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found.",
        });
      }

      room.status = status;

      await room.save();

      return res.status(200).json({
        success: true,
        message: "Room status updated successfully!",
        room,
      });
    } catch (error) {
      console.error("Room Status Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update room status.",
      });
    }
  }
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found.",
        });
      }

      await room.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Room deleted successfully!",
      });
    } catch (error) {
      console.error("Delete Room Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete room.",
      });
    }
  }
);

router.get(
  "/housekeeping",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const rooms = await Room.find({
        status: "cleaning",
        isActive: true,
      }).sort({
        floor: 1,
        roomNumber: 1,
      });

      return res.status(200).json({
        success: true,
        count: rooms.length,
        rooms,
      });
    } catch (error) {
      console.error("Housekeeping Rooms Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load housekeeping rooms.",
      });
    }
  }
);

router.patch(
  "/housekeeping/:id/complete",
  protect,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found.",
        });
      }

      if (room.status !== "cleaning") {
        return res.status(400).json({
          success: false,
          message: "Only rooms awaiting cleaning can be completed.",
        });
      }

      if (!room.isActive) {
        return res.status(400).json({
          success: false,
          message: "This room is currently inactive.",
        });
      }

      room.status = "available";

      await room.save();

      return res.status(200).json({
        success: true,
        message: "Room cleaning completed successfully!",
        room,
      });
    } catch (error) {
      console.error("Complete Housekeeping Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to complete room cleaning.",
      });
    }
  }
);

module.exports = router;