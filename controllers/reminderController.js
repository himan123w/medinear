const MedicineReminder = require("../models/MedicineReminder");

// ===============================
// Helper: Calculate Next Reminder Date
// ===============================
const calculateNextReminderDate = (frequency, baseDate = new Date()) => {
  const nextDate = new Date(baseDate);

  if (frequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (frequency === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (frequency === 'quarterly') {
    nextDate.setMonth(nextDate.getMonth() + 3);
  }

  return nextDate;
};

// ===============================
// Create Reminder - Protected
// ===============================
exports.createReminder = async (req, res) => {
  try {
    const { medicineName, frequency = 'monthly', daysBeforeReminder = 3, category = 'other', dosage = '', notes = '' } = req.body;

    if (!medicineName) {
      return res.status(400).json({ message: 'Medicine name is required' });
    }

    if (!['weekly', 'monthly', 'quarterly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency. Must be weekly, monthly, or quarterly' });
    }

    const nextReminderDate = calculateNextReminderDate(frequency);
    nextReminderDate.setDate(nextReminderDate.getDate() - daysBeforeReminder);

    const reminder = await MedicineReminder.create({
      user: req.user.id,
      medicineName,
      frequency,
      daysBeforeReminder,
      nextReminderDate,
      category,
      dosage,
      notes,
      enabled: true
    });

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get My Reminders - Protected
// ===============================
exports.getMyReminders = async (req, res) => {
  try {
    const reminders = await MedicineReminder.find({
      user: req.user.id
    }).sort({ nextReminderDate: 1 });

    res.json({
      count: reminders.length,
      reminders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Reminder by ID - Protected
// ===============================
exports.getReminderDetail = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Update Reminder - Protected
// ===============================
exports.updateReminder = async (req, res) => {
  try {
    const { medicineName, frequency, daysBeforeReminder, category, dosage, notes, enabled } = req.body;

    const reminder = await MedicineReminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (medicineName) reminder.medicineName = medicineName;
    if (category) reminder.category = category;
    if (dosage !== undefined) reminder.dosage = dosage;
    if (notes !== undefined) reminder.notes = notes;
    if (enabled !== undefined) reminder.enabled = enabled;

    // If frequency or daysBeforeReminder changed, recalculate nextReminderDate
    if (frequency || daysBeforeReminder !== undefined) {
      const newFrequency = frequency || reminder.frequency;
      const newDaysBeforeReminder = daysBeforeReminder !== undefined ? daysBeforeReminder : reminder.daysBeforeReminder;

      const nextReminderDate = calculateNextReminderDate(newFrequency);
      nextReminderDate.setDate(nextReminderDate.getDate() - newDaysBeforeReminder);

      reminder.frequency = newFrequency;
      reminder.daysBeforeReminder = newDaysBeforeReminder;
      reminder.nextReminderDate = nextReminderDate;
    }

    await reminder.save();

    res.json({
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Delete Reminder - Protected
// ===============================
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Toggle Reminder Enabled Status - Protected
// ===============================
exports.toggleReminder = async (req, res) => {
  try {
    const reminder = await MedicineReminder.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.enabled = !reminder.enabled;
    await reminder.save();

    res.json({
      message: `Reminder ${reminder.enabled ? 'enabled' : 'disabled'} successfully`,
      reminder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Check and Trigger Reminders (for scheduled job)
// ===============================
exports.checkAndTriggerReminders = async (req, res) => {
  try {
    const now = new Date();

    // Find all enabled reminders with nextReminderDate <= now
    const triggeredReminders = await MedicineReminder.find({
      enabled: true,
      nextReminderDate: { $lte: now }
    });

    // Update each reminder's lastReminderDate and recalculate nextReminderDate
    const results = await Promise.all(
      triggeredReminders.map(async (reminder) => {
        reminder.lastReminderDate = now;
        reminder.nextReminderDate = calculateNextReminderDate(reminder.frequency, now);
        await reminder.save();

        return {
          _id: reminder._id,
          user: reminder.user,
          medicineName: reminder.medicineName,
          triggered: true,
          message: `Time to refill your ${reminder.medicineName}!`
        };
      })
    );

    res.json({
      count: results.length,
      reminders: results,
      message: `${results.length} reminder(s) triggered`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// Get Upcoming Reminders - Protected (next 7 days)
// ===============================
exports.getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingReminders = await MedicineReminder.find({
      user: req.user.id,
      enabled: true,
      nextReminderDate: {
        $gte: now,
        $lte: sevenDaysFromNow
      }
    }).sort({ nextReminderDate: 1 });

    res.json({
      count: upcomingReminders.length,
      reminders: upcomingReminders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
