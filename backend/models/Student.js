const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true
    },
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      uppercase: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    department: {
      type: String,
      trim: true,
      default: "Computer Science"
    },
    year: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);

