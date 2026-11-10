
const express = require("express");
const router = express.Router();

const {
  addNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice
} = require("../controllers/noticeController");

// Add notice
router.post("/", addNotice);

// Get all notices
router.get("/", getNotices);

// Get one notice
router.get("/:id", getNoticeById);

// Update notice
router.put("/:id", updateNotice);

// Delete notice
router.delete("/:id", deleteNotice);

module.exports = router;