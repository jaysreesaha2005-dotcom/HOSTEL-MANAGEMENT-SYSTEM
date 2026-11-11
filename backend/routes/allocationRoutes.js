const express = require("express");
const router = express.Router();
const allocationController = require("../controllers/allocationController");

// Allocation routes
router.get("/", allocationController.getAllocations);
router.post("/", allocationController.createAllocation);
router.get("/:id", allocationController.getAllocationById);
router.patch("/:id/vacate", allocationController.vacateAllocation);

module.exports = router;

