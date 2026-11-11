const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    course: { type: String, required: true },
    year: { type: String, required: true },
    roomNumber: { type: String, default: "" },
    guardianName: { type: String, default: "" },
    guardianPhone: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);