const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"]
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room reference is required"]
    },
    allocatedDate: {
      type: Date,
      default: Date.now
    },
    vacatedDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["Active", "Vacated"],
      default: "Active"
    },
    remarks: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Allocation", allocationSchema);

