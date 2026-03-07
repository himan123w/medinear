const SaaSSubscription = require('../models/SaaSSubscription');
const Pharmacy = require('../models/Pharmacy');
const { sendEmail, sendSMS } = require('../services/notificationService');

// Create subscription for pharmacy
exports.createSubscription = async (req, res) => {
  try {
    const { pharmacyId, plan, monthlyCharge, nextBillingDate } = req.body;
    if (!pharmacyId) return res.status(400).json({ success: false, message: 'pharmacyId required' });

    const sub = new SaaSSubscription({ pharmacy: pharmacyId, plan: plan || 'basic', monthlyCharge: monthlyCharge || 499, nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : new Date() });
    await sub.save();
    res.json({ success: true, subscription: sub });
  } catch (err) {
    console.error('Create SaaS subscription error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Simple charge processing: mark billed and advance nextBillingDate
async function _processBillingInternal() {
  const now = new Date();
  const due = await SaaSSubscription.find({ status: 'active', nextBillingDate: { $lte: now } });
  const results = [];

  for (const s of due) {
    try {
      // TODO: integrate with payment gateway (Stripe/Razorpay). For now we'll log and send invoice email/SMS
      const pharmacy = await Pharmacy.findById(s.pharmacy);
      const invoiceId = `INV-${s._id.toString()}-${Date.now()}`;

      // send notification
      const message = `Your subscription has been charged ₹${s.monthlyCharge}. Invoice: ${invoiceId}`;
      if (pharmacy && pharmacy.phone) await sendSMS({ to: pharmacy.phone, body: message });
      if (pharmacy && pharmacy.email) await sendEmail({ to: pharmacy.email, subject: 'Subscription Charged', text: message });

      // advance billing date by one month
      const next = new Date(s.nextBillingDate || now);
      next.setMonth(next.getMonth() + 1);
      s.nextBillingDate = next;
      await s.save();

      results.push({ subscriptionId: s._id, invoiceId });
    } catch (err) {
      console.error('Error processing billing for', s._id, err);
    }
  }

  return { count: due.length, processed: results };
}

exports.processBilling = async (req, res) => {
  try {
    const result = await _processBillingInternal();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Process billing error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports._processBillingInternal = _processBillingInternal;
