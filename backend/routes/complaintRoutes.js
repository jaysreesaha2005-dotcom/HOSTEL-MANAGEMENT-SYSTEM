const express = require("express");
const router = express.Router();

const {
  addComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
} = require("../controllers/complaintController");

// Add complaint
router.post("/", addComplaint);

// Get all complaints
router.get("/", getComplaints);

// Get one complaint
router.get("/:id", getComplaintById);

// Update complaint
router.put("/:id", updateComplaint);

// Delete complaint
router.delete("/:id", deleteComplaint);

module.exports = router;
