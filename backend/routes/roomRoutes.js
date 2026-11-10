const express = require("express");
const router = express.Router();

const Room = require("../models/Room");

// Add a room
router.post("/", async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({
      message: "Room added successfully",
      room,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;