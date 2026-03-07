const Subscription = require('../models/Subscription');
const Delivery = require('../models/Delivery');
const Pharmacy = require('../models/Pharmacy');
const { sendEmail, sendSMS } = require('../services/notificationService');
const chronicDiseaseUtils = require('../utils/chronicDiseaseUtils');

// Create a new subscription with chronic disease support
exports.createSubscription = async (req, res) => {
  try {
    const { 
      userId, phone, email, diseaseType, severity, items, address, city, state, zipCode, 
      paymentMethod, nextDeliveryDate, frequency, patientDetails, reminderFrequency 
    } = req.body;

    if (!userId || !phone || !diseaseType) {
      return res.status(400).json({ success: false, message: 'Missing required fields (userId, phone, diseaseType)' });
    }

    // Validate disease type
    if (!Object.values(chronicDiseaseUtils.DISEASE_TYPES).includes(diseaseType)) {
      return res.status(400).json({ success: false, message: 'Invalid disease type' });
    }

    // Calculate price based on disease and severity
    const monthlyPrice = chronicDiseaseUtils.getPrice(diseaseType, severity || 'moderate');
    const nextDelivery = nextDeliveryDate ? new Date(nextDeliveryDate) : chronicDiseaseUtils.calculateNextDeliveryDate(frequency || 'monthly');

    const sub = new Subscription({
      user: userId,
      phone,
      email,
      diseaseType,
      patientDetails: patientDetails || { disease: diseaseType, severity: severity || 'moderate' },
      items: items || chronicDiseaseUtils.getMedicineRecommendations(diseaseType, severity || 'moderate').map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        notes: m.notes
      })),
      address: address || '',
      city,
      state,
      zipCode,
      paymentMethod: paymentMethod || 'cod',
      monthlyPrice,
      nextDeliveryDate: nextDelivery,
      frequency: frequency || 'monthly',
      status: 'active',
      reminderFrequency: reminderFrequency || 'before-delivery'
    });

    await sub.save();
    
    // Send welcome SMS
    const message = `Welcome to Medinear Chronic Care Program! Your ${diseaseType.toUpperCase()} subscription is confirmed. First delivery on ${nextDelivery.toLocaleDateString()}. Monthly cost: ₹${monthlyPrice}`;
    await sendSMS({ to: phone, body: message }).catch(err => console.error('SMS sending error:', err));

    res.json({ 
      success: true, 
      subscription: sub,
      recommendations: {
        medicines: chronicDiseaseUtils.getMedicineRecommendations(diseaseType, severity || 'moderate'),
        diet: chronicDiseaseUtils.getDietaryGuidelines(diseaseType),
        exercise: chronicDiseaseUtils.getExerciseRecommendations(diseaseType),
        monitoring: chronicDiseaseUtils.getMonitoringFrequency(diseaseType)
      }
    });
  } catch (err) {
    console.error('Create subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get subscriptions for a user
exports.getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const subs = await Subscription.find({ user: userId }).sort({ createdAt: -1 }).populate('user');
    res.json({ success: true, subscriptions: subs });
  } catch (err) {
    console.error('Get user subscriptions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get subscription by ID with full details
exports.getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findById(id).populate('user');
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    
    const recommendations = {
      medicines: chronicDiseaseUtils.getMedicineRecommendations(sub.diseaseType, sub.patientDetails?.severity || 'moderate'),
      diet: chronicDiseaseUtils.getDietaryGuidelines(sub.diseaseType),
      exercise: chronicDiseaseUtils.getExerciseRecommendations(sub.diseaseType),
      monitoring: chronicDiseaseUtils.getMonitoringFrequency(sub.diseaseType),
      diseaseInfo: chronicDiseaseUtils.getDiseaseInfo(sub.diseaseType)
    };

    res.json({ success: true, subscription: sub, recommendations });
  } catch (err) {
    console.error('Get subscription by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update subscription details
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Recalculate price if severity changes
    if (updates.patientDetails?.severity) {
      updates.monthlyPrice = chronicDiseaseUtils.getPrice(
        updates.diseaseType || (await Subscription.findById(id)).diseaseType,
        updates.patientDetails.severity
      );
    }

    const sub = await Subscription.findByIdAndUpdate(id, updates, { new: true }).populate('user');
    res.json({ success: true, subscription: sub });
  } catch (err) {
    console.error('Update subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Pause subscription
exports.pauseSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findByIdAndUpdate(id, { status: 'paused' }, { new: true });
    
    // Send SMS notification
    const message = `Your Medinear ${sub.diseaseType.toUpperCase()} subscription has been paused. You can resume anytime.`;
    await sendSMS({ to: sub.phone, body: message }).catch(err => console.error('SMS error:', err));

    res.json({ success: true, message: 'Subscription paused', subscription: sub });
  } catch (err) {
    console.error('Pause subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Resume subscription
exports.resumeSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findByIdAndUpdate(id, { status: 'active' }, { new: true });
    
    const message = `Your Medinear ${sub.diseaseType.toUpperCase()} subscription is now active. Next delivery: ${sub.nextDeliveryDate.toLocaleDateString()}`;
    await sendSMS({ to: sub.phone, body: message }).catch(err => console.error('SMS error:', err));

    res.json({ success: true, message: 'Subscription resumed', subscription: sub });
  } catch (err) {
    console.error('Resume subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const sub = await Subscription.findByIdAndUpdate(
      id, 
      { status: 'cancelled', autoRenew: false }, 
      { new: true }
    );
    
    const message = `Your Medinear subscription for ${sub.diseaseType.toUpperCase()} has been cancelled.`;
    await sendSMS({ to: sub.phone, body: message }).catch(err => console.error('SMS error:', err));

    res.json({ success: true, message: 'Subscription cancelled', subscription: sub });
  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get chronic disease recommendations
exports.getDiseaseRecommendations = async (req, res) => {
  try {
    const { disease, severity = 'moderate' } = req.query;

    if (!disease || !Object.values(chronicDiseaseUtils.DISEASE_TYPES).includes(disease)) {
      return res.status(400).json({ success: false, message: 'Invalid disease type' });
    }

    const recommendations = {
      disease,
      severity,
      medicines: chronicDiseaseUtils.getMedicineRecommendations(disease, severity),
      diet: chronicDiseaseUtils.getDietaryGuidelines(disease),
      exercise: chronicDiseaseUtils.getExerciseRecommendations(disease),
      monitoring: chronicDiseaseUtils.getMonitoringFrequency(disease),
      diseaseInfo: chronicDiseaseUtils.getDiseaseInfo(disease),
      monthlyPrice: chronicDiseaseUtils.getPrice(disease, severity)
    };

    res.json({ success: true, recommendations });
  } catch (err) {
    console.error('Get disease recommendations error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all disease types for dropdown/selection
exports.getDiseaseTypes = async (req, res) => {
  try {
    const diseases = Object.entries(chronicDiseaseUtils.DISEASE_TYPES).map(([key, value]) => ({
      id: value,
      name: key.charAt(0) + key.slice(1).toLowerCase(),
      info: chronicDiseaseUtils.getDiseaseInfo(value)
    }));
    
    res.json({ success: true, diseases });
  } catch (err) {
    console.error('Get disease types error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Process due subscriptions (auto-order creation)
async function _processDueSubscriptionsInternal() {
  const now = new Date();
  const due = await Subscription.find({ status: 'active', nextDeliveryDate: { $lte: now } });

  const processed = [];
  for (const sub of due) {
    try {
      const pharmacy = await Pharmacy.findOne();

      if (!pharmacy) {
        console.warn('No pharmacy available to fulfill subscription', sub._id);
        continue;
      }

      const items = (sub.items || []).map(i => ({ name: i.name, quantity: i.quantity || 1, price: 0 }));
      const orderId = `SUB-${sub._id.toString()}-${Date.now()}`;

      const delivery = new Delivery({
        orderId,
        orderType: 'medicine-order',
        pharmacy: pharmacy._id,
        customer: sub.user || null,
        customerPhone: sub.phone,
        customerName: '',
        pickupLocation: {
          address: pharmacy.address || '',
          latitude: pharmacy.latitude || 0,
          longitude: pharmacy.longitude || 0,
          location: {
            type: 'Point',
            coordinates: [pharmacy.longitude || 0, pharmacy.latitude || 0]
          },
          pickupTime: new Date()
        },
        deliveryLocation: {
          address: sub.address || '',
          latitude: 0,
          longitude: 0,
          location: { type: 'Point', coordinates: [0, 0] },
          instructions: ''
        },
        items,
        orderAmount: sub.monthlyPrice || 0,
        deliveryCharge: 0,
        totalAmount: sub.monthlyPrice || 0,
        deliveryType: 'scheduled',
        estimatedDeliveryTime: pharmacy.deliveryTime || 45,
        status: 'confirmed',
        statusHistory: [{ status: 'confirmed', timestamp: new Date(), notes: 'Chronic subscription auto-order created' }]
      });

      await delivery.save();

      // Update total spent
      sub.totalSpent = (sub.totalSpent || 0) + (sub.monthlyPrice || 0);

      // Advance next delivery date if autoRenew
      if (sub.autoRenew) {
        const next = new Date(sub.nextDeliveryDate || now);
        const frequency = sub.frequency || 'monthly';
        
        if (frequency === 'monthly') {
          next.setMonth(next.getMonth() + 1);
        } else if (frequency === 'quarterly') {
          next.setMonth(next.getMonth() + 3);
        } else if (frequency === 'half-yearly') {
          next.setMonth(next.getMonth() + 6);
        }
        
        sub.nextDeliveryDate = next;
        await sub.save();
      }

      // Send SMS notification
      const smsBody = `Your monthly ${sub.diseaseType.toUpperCase()} subscription medicines delivery order ${orderId} has been confirmed. Estimated delivery: ${new Date(Date.now() + (pharmacy.deliveryTime || 45) * 60000).toLocaleDateString()}`;
      await sendSMS({ to: sub.phone, body: smsBody }).catch(err => console.error('SMS error:', err));

      processed.push({ subscriptionId: sub._id, deliveryId: delivery._id });
    } catch (err) {
      console.error('Error processing subscription', sub._id, err);
    }
  }

  return { count: due.length, processed };
}

// Express route handler
exports.processDueSubscriptions = async (req, res) => {
  try {
    const result = await _processDueSubscriptionsInternal();
    res.json({ success: true, dueCount: result.count, processedCount: result.processed.length, processedIds: result.processed });
  } catch (err) {
    console.error('Process due subscriptions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export internal function for cron jobs
exports._processDueSubscriptionsInternal = _processDueSubscriptionsInternal;

