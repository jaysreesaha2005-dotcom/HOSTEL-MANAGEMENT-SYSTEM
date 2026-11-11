const Allocation = require("../models/Allocation");
const Room = require("../models/Room");
const Student = require("../models/Student");

// Helper to determine status after occupancy change
const getRoomStatusFromOccupancy = (occupancy, capacity, currentStatus) => {
  if (currentStatus === "Under Maintenance") {
    return "Under Maintenance";
  }
  if (occupancy <= 0) {
    return "Available";
  }
  if (occupancy >= capacity) {
    return "Full";
  }
  return "Partially Occupied";
};

// Allocate a room to a student
exports.createAllocation = async (req, res) => {
  try {
    const { studentId, roomId, remarks } = req.body;

    if (!studentId || !roomId) {
      return res.status(400).json({
        success: false,
        message: "Student and Room are required"
      });
    }

    // 1. Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student record not found in system"
      });
    }

    // 2. Business rule: Student cannot have multiple active allocations
    const existingActiveAllocation = await Allocation.findOne({
      student: studentId,
      status: "Active"
    }).populate("room");

    if (existingActiveAllocation) {
      const roomNum = existingActiveAllocation.room ? existingActiveAllocation.room.roomNumber : "an existing room";
      return res.status(400).json({
        success: false,
        message: `Student ${student.name} (${student.registrationNumber}) already has an active allocation in Room ${roomNum}`
      });
    }

    // 3. Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }

    // 4. Business rule: Check if room is under maintenance
    if (room.status === "Under Maintenance") {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is currently under maintenance and cannot accept allocations`
      });
    }

    // 5. Business rule: Safe atomic check and increment to prevent race conditions
    // Atomically increments occupancy ONLY IF currentOccupancy < capacity
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        status: { $ne: "Under Maintenance" },
        $expr: { $lt: ["$currentOccupancy", "$capacity"] }
      },
      { $inc: { currentOccupancy: 1 } },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} has reached its maximum capacity (${room.capacity} beds)`
      });
    }

    // 6. Recalculate room status based on the new occupancy
    updatedRoom.status = getRoomStatusFromOccupancy(
      updatedRoom.currentOccupancy,
      updatedRoom.capacity,
      updatedRoom.status
    );
    await updatedRoom.save();

    // 7. Create allocation record
    const allocation = await Allocation.create({
      student: studentId,
      room: roomId,
      remarks: remarks || "",
      status: "Active",
      allocatedDate: new Date()
    });

    const populatedAllocation = await Allocation.findById(allocation._id)
      .populate("student")
      .populate("room");

    res.status(201).json({
      success: true,
      message: `Room ${room.roomNumber} successfully allocated to ${student.name}`,
      data: populatedAllocation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all allocations (with optional status filter and search)
exports.getAllocations = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    let allocations = await Allocation.find(query)
      .populate("student")
      .populate("room")
      .sort({ createdAt: -1 });

    // Client-level search filtering across populated student name, regNo, and roomNumber
    if (search && search.trim() !== "") {
      const s = search.trim().toLowerCase();
      allocations = allocations.filter(item => {
        const studentName = item.student?.name?.toLowerCase() || "";
        const regNo = item.student?.registrationNumber?.toLowerCase() || "";
        const roomNum = item.student?.roomNumber?.toLowerCase() || item.room?.roomNumber?.toLowerCase() || "";
        return studentName.includes(s) || regNo.includes(s) || roomNum.includes(s);
      });
    }

    res.status(200).json({
      success: true,
      data: allocations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single allocation by ID
exports.getAllocationById = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate("student")
      .populate("room");

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: "Allocation record not found"
      });
    }

    res.status(200).json({
      success: true,
      data: allocation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Vacate a room allocation (Releases the bed and preserves history)
exports.vacateAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate("student")
      .populate("room");

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: "Allocation record not found"
      });
    }

    if (allocation.status === "Vacated") {
      return res.status(400).json({
        success: false,
        message: "This allocation has already been marked as vacated"
      });
    }

    // 1. Mark allocation as Vacated with timestamp
    allocation.status = "Vacated";
    allocation.vacatedDate = new Date();
    if (req.body.remarks) {
      allocation.remarks = req.body.remarks;
    }
    await allocation.save();

    // 2. Decrement room occupancy atomically (never below 0)
    const room = await Room.findById(allocation.room._id || allocation.room);
    if (room) {
      room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
      room.status = getRoomStatusFromOccupancy(
        room.currentOccupancy,
        room.capacity,
        room.status
      );
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: `Room ${allocation.room?.roomNumber || ""} vacated successfully for student ${allocation.student?.name || ""}`,
      data: allocation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

