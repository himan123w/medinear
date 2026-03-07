const BackInStockNotification = require('../models/BackInStockNotification');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');

// Subscribe to back-in-stock notification
exports.subscribeToBackInStock = async (req, res) => {
  try {
    const { medicineId, medicineName, pharmacyId, email, maxPriceLimit, notificationMethod } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!medicineId && !medicineName) {
      return res.status(400).json({
        success: false,
        message: 'Medicine ID or name is required'
      });
    }

    if (!pharmacyId) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacy ID is required'
      });
    }

    // Get medicine details
    const medicine = medicineId ? 
      await Medicine.findById(medicineId) :
      await Medicine.findOne({ name: { $regex: medicineName, $options: 'i' } });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Get pharmacy details
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    // Check if already subscribed
    const existingSubscription = await BackInStockNotification.findOne({
      medicine: medicine._id,
      pharmacy: pharmacy._id,
      $or: [
        { user: userId || null },
        { email: email || null }
      ],
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Already subscribed to this medicine notification'
      });
    }

    // Create notification subscription
    const notification = new BackInStockNotification({
      user: userId || null,
      email: email?.toLowerCase() || null,
      medicine: medicine._id,
      medicineName: medicine.name,
      dosage: req.body.dosage || '',
      pharmacy: pharmacy._id,
      pharmacyName: pharmacy.name,
      pharmacyPhone: pharmacy.phone,
      maxPriceLimit: maxPriceLimit || null,
      priceAtSubscription: medicine.price,
      notificationMethod: notificationMethod || 'email',
      searchQuery: req.body.searchQuery || null,
      deviceId: req.body.deviceId || null
    });

    await notification.save();

    res.json({
      success: true,
      message: `🔔 Subscribed to ${medicine.name} notifications at ${pharmacy.name}`,
      notification: {
        _id: notification._id,
        medicineName: notification.medicineName,
        pharmacyName: notification.pharmacyName,
        method: notification.notificationMethod,
        expiresAt: notification.expiresAt
      }
    });
  } catch (error) {
    console.error('Error subscribing to back-in-stock notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error subscribing to notification',
      error: error.message
    });
  }
};

// Get user's subscriptions
exports.getMySubscriptions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const email = req.query.email;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email required'
      });
    }

    let subscriptions;
    if (userId) {
      subscriptions = await BackInStockNotification.getByUser(userId);
    } else {
      subscriptions = await BackInStockNotification.getByEmail(email);
    }

    // Populate medicine and pharmacy details
    subscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        const medicine = await Medicine.findById(sub.medicine).select('name price dosage');
        const pharmacy = await Pharmacy.findById(sub.pharmacy).select('name phone area');
        return {
          ...sub.toObject(),
          medicine,
          pharmacy
        };
      })
    );

    res.json({
      success: true,
      subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user?.id;

    // Find subscription
    const subscription = await BackInStockNotification.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Verify ownership
    if (userId && !subscription.user.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this subscription'
      });
    }

    // Cancel subscription
    await subscription.cancel();

    res.json({
      success: true,
      message: `✓ Unsubscribed from ${subscription.medicineName} notifications`
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { medicineId, pharmacyId } = req.query;
    const userId = req.user?.id;
    const email = req.query.email;

    if (!medicineId || !pharmacyId) {
      return res.status(400).json({
        success: false,
        message: 'Medicine ID and Pharmacy ID required'
      });
    }

    const subscription = await BackInStockNotification.findOne({
      medicine: medicineId,
      pharmacy: pharmacyId,
      $or: [
        { user: userId || null },
        { email: email || null }
      ],
      status: 'active'
    });

    res.json({
      success: true,
      isSubscribed: !!subscription,
      subscription: subscription ? {
        _id: subscription._id,
        status: subscription.status,
        createdAt: subscription.createdAt,
        expiresAt: subscription.expiresAt,
        notificationMethod: subscription.notificationMethod
      } : null
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status',
      error: error.message
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    const stats = await BackInStockNotification.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          notified: {
            $sum: {
              $cond: [{ $eq: ['$status', 'notified'] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const data = stats[0] || { total: 0, active: 0, notified: 0, cancelled: 0 };

    res.json({
      success: true,
      stats: data
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification stats',
      error: error.message
    });
  }
};

module.exports = exports;
