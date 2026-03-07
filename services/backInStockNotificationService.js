const nodemailer = require('nodemailer');
const BackInStockNotification = require('../models/BackInStockNotification');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');

// Initialize email transporter (update with your email config)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * Check all active subscriptions and notify users when stock is back
 */
exports.checkAndNotifyOutOfStock = async () => {
  try {
    console.log('🔔 Starting back-in-stock notification check...');

    // Get all active pending notifications
    const pendingNotifications = await BackInStockNotification.getActivePendingNotifications();

    if (pendingNotifications.length === 0) {
      console.log('✓ No pending notifications to check');
      return { checked: 0, notified: 0, errors: 0 };
    }

    console.log(`Found ${pendingNotifications.length} pending notifications to check`);

    let notificationStats = {
      checked: 0,
      notified: 0,
      errors: 0
    };

    for (const notification of pendingNotifications) {
      try {
        // Check if subscription has expired
        if (notification.isExpired()) {
          await notification.cancel();
          console.log(`⏰ Subscription expired for medicine ${notification.medicineName}`);
          continue;
        }

        // Increment check count
        notification.incrementCheckCount();

        // Get current medicine and pharmacy data
        const medicine = await Medicine.findById(notification.medicine);
        const pharmacy = await Pharmacy.findById(notification.pharmacy);

        if (!medicine || !pharmacy) {
          console.warn(`⚠ Medicine or pharmacy not found for notification ${notification._id}`);
          notificationStats.errors++;
          continue;
        }

        // Get pharmacy-specific medicine stock from inventory
        let currentStock = 0;
        if (pharmacy.medicines && pharmacy.medicines.length > 0) {
          const medicineInventory = pharmacy.medicines.find(
            m => m.medicine.toString() === medicine._id.toString()
          );
          currentStock = medicineInventory?.stock || 0;
        }

        // Check if stock is now available and meets price requirements
        const isStockAvailable = currentStock > 0;
        const meetsPrice = !notification.maxPriceLimit || medicine.price <= notification.maxPriceLimit;

        if (isStockAvailable && meetsPrice) {
          // Mark as notified and send notification
          await this.sendBackInStockNotification(notification, medicine, pharmacy, currentStock);
          await notification.markAsNotified();
          notificationStats.notified++;

          console.log(`✅ Notification sent for ${medicine.name} at ${pharmacy.name}`);
        } else if (!isStockAvailable) {
          // Still out of stock, update check timestamp
          notification.lastCheckedAt = new Date();
          await notification.save();
          console.log(`📦 ${medicine.name} still out of stock at ${pharmacy.name}`);
        } else {
          // Price exceeds limit
          console.log(`💰 ${medicine.name} price exceeds limit at ${pharmacy.name}`);
        }

        notificationStats.checked++;
      } catch (error) {
        console.error('Error processing notification:', error);
        notificationStats.errors++;
      }
    }

    console.log(`✓ Notification check completed:`, notificationStats);
    return notificationStats;
  } catch (error) {
    console.error('Error checking out-of-stock notifications:', error);
    throw error;
  }
};

/**
 * Send back-in-stock notification via email
 */
exports.sendBackInStockNotification = async (notification, medicine, pharmacy, stock) => {
  try {
    const recipientEmail = notification.email || 
      (notification.user && notification.user.email) || 
      null;

    if (!recipientEmail) {
      console.warn('No email found for notification', notification._id);
      return false;
    }

    // Prepare email content
    const emailSubject = `✅ ${medicine.name} is back in stock at ${pharmacy.name}!`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Medicine Available!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
            Great news! <strong>${medicine.name}</strong> (${notification.dosage || 'N/A'}) is now back in stock at:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">📍 ${pharmacy.name}</h3>
            <p style="margin: 5px 0; color: #666;">
              📞 ${pharmacy.phone || 'N/A'}<br>
              📦 Available Stock: <strong>${stock} units</strong><br>
              ${medicine.price ? `💰 Price: ₹${medicine.price}` : ''}
            </p>
          </div>

          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #2e7d32;">
              ✓ This medicine matches your notification preferences${notification.maxPriceLimit ? ` (Max Price: ₹${notification.maxPriceLimit})` : ''}
            </p>
          </div>

          <p style="margin: 0; color: #666; font-size: 14px;">
            This notification was sent because you requested an alert when this medicine became available. 
            You will not receive further notifications unless you subscribe again.
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0;">
            © MediNear - Your Medicine, Our Priority<br>
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const plainText = `
      ${medicine.name} is back in stock at ${pharmacy.name}!

      Pharmacy: ${pharmacy.name}
      Phone: ${pharmacy.phone || 'N/A'}
      Available Stock: ${stock} units
      Price: ₹${medicine.price || 'N/A'}
      
      You requested this notification, so we've alerted you that this medicine is now available.
      
      - MediNear Team
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@medinear.com',
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
      text: plainText
    });

    console.log(`✉️ Email sent to ${recipientEmail} for ${medicine.name}`);
    return true;
  } catch (error) {
    console.error('Error sending back-in-stock notification email:', error);
    throw error;
  }
};

/**
 * Send bulk SMS notification (requires SMS service provider)
 */
exports.sendSMSNotification = async (phoneNumber, medicine, pharmacy) => {
  try {
    // Placeholder for SMS service integration (Twilio, AWS SNS, etc.)
    const message = `✅ ${medicine.name} is back in stock at ${pharmacy.name}! Check availability now!`;
    
    console.log(`📱 SMS would be sent to ${phoneNumber}: ${message}`);
    // TODO: Integrate with actual SMS provider

    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};

/**
 * Send push notification (requires push service)
 */
exports.sendPushNotification = async (deviceToken, medicine, pharmacy) => {
  try {
    // Placeholder for push notification service integration (Firebase Cloud Messaging, etc.)
    const notificationData = {
      title: `✅ ${medicine.name} Available!`,
      body: `${medicine.name} is back in stock at ${pharmacy.name}`
    };

    console.log(`📲 Push notification would be sent:`, notificationData);
    // TODO: Integrate with actual push service

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Clean up expired subscriptions
 */
exports.cleanupExpiredSubscriptions = async () => {
  try {
    console.log('🧹 Cleaning up expired subscriptions...');

    const result = await BackInStockNotification.updateMany(
      {
        expiresAt: { $lt: new Date() },
        status: { $in: ['active', 'notified'] }
      },
      {
        status: 'expired'
      }
    );

    console.log(`✓ Cleaned up ${result.modifiedCount} expired subscriptions`);
    return result;
  } catch (error) {
    console.error('Error cleaning up expired subscriptions:', error);
    throw error;
  }
};

/**
 * Get notification service statistics
 */
exports.getServiceStats = async () => {
  try {
    const stats = await BackInStockNotification.aggregate([
      {
        $group: {
          _id: null,
          totalSubscriptions: { $sum: 1 },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          notifiedUsers: {
            $sum: {
              $cond: [{ $eq: ['$status', 'notified'] }, 1, 0]
            }
          },
          cancelledSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          expiredSubscriptions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'expired'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      notifiedUsers: 0,
      cancelledSubscriptions: 0,
      expiredSubscriptions: 0
    };
  } catch (error) {
    console.error('Error fetching service stats:', error);
    throw error;
  }
};

module.exports = exports;
