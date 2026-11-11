const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true,
      uppercase: true
    },
    floor: {
      type: Number,
      required: [true, "Floor number is required"],
      min: [0, "Floor number cannot be negative"],
      default: 1
    },
    roomType: {
      type: String,
      required: [true, "Room type is required"],
      enum: ["Single", "Double", "Triple", "Quad", "Dormitory"],
      default: "Double"
    },
    capacity: {
      type: Number,
      required: [true, "Total capacity is required"],
      min: [1, "Total capacity must be at least 1"],
      default: 2
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: [0, "Occupancy cannot be negative"]
    },
    facilities: {
      type: [String],
      default: ["Study Table", "WiFi", "Wardrobe"]
    },
    status: {
      type: String,
      enum: ["Available", "Partially Occupied", "Full", "Under Maintenance"],
      default: "Available"
    }
  },
  { timestamps: true }
);

// Method to determine status based on occupancy and capacity
roomSchema.methods.updateCalculatedStatus = function () {
  if (this.status === "Under Maintenance") {
    return this.status;
  }
  if (this.currentOccupancy === 0) {
    this.status = "Available";
  } else if (this.currentOccupancy >= this.capacity) {
    this.status = "Full";
  } else {
    this.status = "Partially Occupied";
  }
  return this.status;
};

module.exports = mongoose.model("Room", roomSchema);
