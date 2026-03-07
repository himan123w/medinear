const express = require("express");
const router = express.Router();

const {
  createReminder,
  getMyReminders,
  getReminderDetail,
  updateReminder,
  deleteReminder,
  toggleReminder,
  checkAndTriggerReminders,
  getUpcomingReminders
} = require("../controllers/reminderController");

const authMiddleware = require("../middleware/authMiddleware");

// 🔒 Protected Routes (User Auth Required)
router.post("/create", authMiddleware, createReminder);
router.get("/my-reminders", authMiddleware, getMyReminders);
router.get("/upcoming", authMiddleware, getUpcomingReminders);
router.get("/:id", authMiddleware, getReminderDetail);
router.put("/:id", authMiddleware, updateReminder);
router.delete("/:id", authMiddleware, deleteReminder);
router.put("/:id/toggle", authMiddleware, toggleReminder);

// 📋 Admin/Cron Job Route (optional: add API key or basic auth)
router.post("/check-trigger", checkAndTriggerReminders);

module.exports = router;
