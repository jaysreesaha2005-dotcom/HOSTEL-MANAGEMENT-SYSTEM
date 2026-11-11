const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const complaintRoutes = require("./routes/complaintRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const roomRoutes = require("./routes/roomRoutes");
const allocationRoutes = require("./routes/allocationRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.send("HostelHub Backend is Running!");
});

// Complaint routes
app.use("/api/complaints", complaintRoutes);

// Notice routes
app.use("/api/notices", noticeRoutes);

// Room routes
app.use("/api/rooms", roomRoutes);

// Allocation routes
app.use("/api/allocations", allocationRoutes);

// Student routes
app.use("/api/students", studentRoutes);

// Server port
const PORT = 5000;

// Connect MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/hostelhub")
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });