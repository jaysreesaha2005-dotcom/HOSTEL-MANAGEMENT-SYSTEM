const Student = require("../models/Student");
const Room = require("../models/Room");
const Complaint = require("../models/Complaint");
const Notice = require("../models/Notice");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalNotices = await Notice.countDocuments();

    const occupiedRoomNumbers = await Student.distinct("roomNumber", {
      roomNumber: { $nin: ["", null] },
    });

    const occupiedRooms = occupiedRoomNumbers.length;
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);

    const pendingComplaints = await Complaint.countDocuments({
      status: "Pending",
    });

    const [pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "In Progress" }),
      Complaint.countDocuments({ status: "Resolved" }),
    ]);

    res.status(200).json({
      totalStudents,
      totalRooms,
      occupiedRooms,
      availableRooms,
      pendingComplaints,
      totalNotices,
      complaintStats: [
        { name: "Pending", value: pending },
        { name: "In Progress", value: inProgress },
        { name: "Resolved", value: resolved },
      ],
      roomStats: [
        { name: "Occupied", value: occupiedRooms },
        { name: "Available", value: availableRooms },
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to load dashboard statistics",
      error: error.message,
    });
  }
};