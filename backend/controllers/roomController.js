const Room = require("../models/Room");
const Allocation = require("../models/Allocation");

// Helper to recalculate room status
const getCalculatedStatus = (occupancy, capacity, currentStatus) => {
  if (currentStatus === "Under Maintenance") {
    return "Under Maintenance";
  }
  if (occupancy === 0) {
    return "Available";
  }
  if (occupancy >= capacity) {
    return "Full";
  }
  return "Partially Occupied";
};

// Add a new room
exports.addRoom = async (req, res) => {
  try {
    const { roomNumber, floor, roomType, capacity, facilities, status } = req.body;

    if (!roomNumber || floor === undefined || !roomType || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Room number, floor, room type, and capacity are required"
      });
    }

    if (Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be at least 1"
      });
    }

    const normalizedRoomNumber = roomNumber.toString().trim().toUpperCase();

    // Check duplicate room number
    const existingRoom = await Room.findOne({ roomNumber: normalizedRoomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room ${normalizedRoomNumber} already exists`
      });
    }

    const initialStatus = status === "Under Maintenance" ? "Under Maintenance" : "Available";

    const newRoom = await Room.create({
      roomNumber: normalizedRoomNumber,
      floor: Number(floor),
      roomType,
      capacity: Number(capacity),
      currentOccupancy: 0,
      facilities: Array.isArray(facilities) ? facilities : (facilities ? facilities.split(",").map(f => f.trim()) : ["Study Table", "WiFi", "Wardrobe"]),
      status: initialStatus
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: newRoom
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all rooms with optional filtering & search + statistics
exports.getRooms = async (req, res) => {
  try {
    const { search, floor, roomType, status } = req.query;

    const filter = {};

    if (floor !== undefined && floor !== "") {
      filter.floor = Number(floor);
    }

    if (roomType && roomType !== "All") {
      filter.roomType = roomType;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { roomNumber: searchRegex },
        { facilities: searchRegex }
      ];
    }

    const rooms = await Room.find(filter).sort({ floor: 1, roomNumber: 1 });

    // Compute overall statistics across all rooms
    const allRooms = await Room.find();
    const stats = {
      totalRooms: allRooms.length,
      availableRooms: allRooms.filter(r => r.status === "Available").length,
      partiallyOccupiedRooms: allRooms.filter(r => r.status === "Partially Occupied").length,
      fullRooms: allRooms.filter(r => r.status === "Full").length,
      maintenanceRooms: allRooms.filter(r => r.status === "Under Maintenance").length
    };

    res.status(200).json({
      success: true,
      data: rooms,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single room details with active occupants
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Find active allocations for this room
    const activeAllocations = await Allocation.find({
      room: room._id,
      status: "Active"
    }).populate("student");

    res.status(200).json({
      success: true,
      data: {
        room,
        occupants: activeAllocations
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update room details
exports.updateRoom = async (req, res) => {
  try {
    const { floor, roomType, capacity, facilities, status } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Validate capacity reduction: capacity cannot be lower than current occupancy
    if (capacity !== undefined) {
      const newCapacity = Number(capacity);
      if (newCapacity < 1) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be at least 1"
        });
      }
      if (newCapacity < room.currentOccupancy) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity to ${newCapacity}. Current occupancy is ${room.currentOccupancy}.`
        });
      }
      room.capacity = newCapacity;
    }

    if (floor !== undefined) {
      room.floor = Number(floor);
    }

    if (roomType) {
      room.roomType = roomType;
    }

    if (facilities !== undefined) {
      room.facilities = Array.isArray(facilities)
        ? facilities
        : facilities.split(",").map(f => f.trim()).filter(Boolean);
    }

    if (status) {
      if (status === "Under Maintenance") {
        room.status = "Under Maintenance";
      } else {
        // Recalculate status from occupancy
        room.status = getCalculatedStatus(room.currentOccupancy, room.capacity, status);
      }
    } else {
      room.status = getCalculatedStatus(room.currentOccupancy, room.capacity, room.status);
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // Rule: Do not allow deletion of rooms with active allocations or current occupants
    if (room.currentOccupancy > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Room ${room.roomNumber} because it currently has ${room.currentOccupancy} occupant(s). Please vacate all occupants before deleting.`
      });
    }

    const activeAllocations = await Allocation.countDocuments({
      room: room._id,
      status: "Active"
    });

    if (activeAllocations > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Room ${room.roomNumber} because it has active allocations. Please vacate them first.`
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get room summary stats
exports.getRoomStats = async (req, res) => {
  try {
    const allRooms = await Room.find();
    const stats = {
      totalRooms: allRooms.length,
      availableRooms: allRooms.filter(r => r.status === "Available").length,
      partiallyOccupiedRooms: allRooms.filter(r => r.status === "Partially Occupied").length,
      fullRooms: allRooms.filter(r => r.status === "Full").length,
      maintenanceRooms: allRooms.filter(r => r.status === "Under Maintenance").length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

