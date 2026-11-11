const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Stats summary route (must be before /:id)
router.get("/stats/summary", roomController.getRoomStats);

// Get all rooms and create room
router.get("/", roomController.getRooms);
router.post("/", roomController.addRoom);

// Single room operations
router.get("/:id", roomController.getRoomById);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;

