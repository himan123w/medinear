const SaasBilling = require('../models/SaasBilling');
const Pharmacy = require('../models/Pharmacy');

// Plan configurations with features and pricing
const PLANS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 4999,
    annualPrice: 49990,
    description: 'Perfect for small pharmacies',
    features: {
      inventoryItems: 250,
      analyticsRetention: 6,
      stockPredictionItems: 50,
      teamMembers: 1,
      apiCallsPerMonth: 5000,
      customizationLevel: 'none'
    },
    color: '#3498db'
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 9999,
    annualPrice: 99990,
    description: 'For growing pharmacies',
    features: {
      inventoryItems: 1000,
      analyticsRetention: 12,
      stockPredictionItems: 250,
      teamMembers: 3,
      apiCallsPerMonth: 50000,
      customizationLevel: 'basic'
    },
    color: '#2ecc71'
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 24999,
    annualPrice: 249990,
    description: 'For large pharmacy chains',
    features: {
      inventoryItems: 5000,
      analyticsRetention: 24,
      stockPredictionItems: 1000,
      teamMembers: 10,
      apiCallsPerMonth: 500000,
      customizationLevel: 'advanced'
    },
    color: '#e74c3c'
  }
};

// Create new subscription
async function createSubscription(pharmacyId, planType, billingCycle = 'monthly', paymentDetails = {}) {
  try {
    // Check if pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error('Pharmacy not found');
    }
    
    // Check if already has active subscription
    const existingBilling = await SaasBilling.findOne({
      pharmacy: pharmacyId,
      status: { $in: ['trial', 'active'] }
    });
    
    if (existingBilling) {
      throw new Error('Pharmacy already has an active subscription');
    }
    
    const plan = PLANS[planType];
    if (!plan) {
      throw new Error('Invalid plan type');
    }
    
    const monthlyCharge = plan.monthlyPrice;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial
    
    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 14);
    
    const billing = new SaasBilling({
      pharmacy: pharmacyId,
      plan: planType,
      monthlyCharge: monthlyCharge,
      billingCycle: billingCycle,
      status: 'trial',
      trialEndDate: trialEndDate,
      nextBillingDate: nextBillingDate,
      paymentMethod: paymentDetails.method || 'card',
      paymentDetails: {
        cardLast4: paymentDetails.cardLast4 || '',
        cardBrand: paymentDetails.cardBrand || '',
        email: paymentDetails.email,
        phone: paymentDetails.phone
      },
      features: { ...plan.features },
      currentUsage: {
        inventoryItems: 0,
        teamMembers: 1,
        apiCallsThisMonth: 0,
        storageUsedMB: 0
      }
    });
    
    await billing.save();
    
    return {
      success: true,
      subscription: billing,
      trialDays: 14,
      message: 'Welcome! Your 14-day free trial has started'
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Get subscription details
async function getSubscription(pharmacyId) {
  try {
    const billing = await SaasBilling.findOne({ pharmacy: pharmacyId });
    
    if (!billing) {
      return { message: 'No subscription found. Start a free trial!' };
    }
    
    // Calculate remaining trial days
    let remainingTrialDays = 0;
    if (billing.status === 'trial' && billing.trialEndDate) {
      remainingTrialDays = Math.max(0, Math.ceil((billing.trialEndDate - new Date()) / (1000 * 60 * 60 * 24)));
    }
    
    // Get usage percentage
    const usagePercentage = {
      inventory: (billing.currentUsage.inventoryItems / billing.features.inventoryItems) * 100,
      teamMembers: (billing.currentUsage.teamMembers / billing.features.teamMembers) * 100,
      apiCalls: (billing.currentUsage.apiCallsThisMonth / billing.features.apiCallsPerMonth) * 100,
      storage: (billing.currentUsage.storageUsedMB / (billing.features.analyticsRetention * 5000)) * 100 // Rough estimate
    };
    
    return {
      subscription: billing,
      planDetails: PLANS[billing.plan],
      remainingTrialDays,
      usagePercentage,
      isTrialActive: billing.status === 'trial',
      daysUntilBilling: Math.ceil((billing.nextBillingDate - new Date()) / (1000 * 60 * 60 * 24))
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
}

// Upgrade or downgrade plan
async function changePlan(pharmacyId, newPlanType) {
  try {
    const billing = await SaasBilling.findOne({ pharmacy: pharmacyId });
    
    if (!billing) {
      throw new Error('No subscription found');
    }
    
    const newPlan = PLANS[newPlanType];
    if (!newPlan) {
      throw new Error('Invalid plan type');
    }
    
    // Create prorated invoice for plan change
    const oldPlan = PLANS[billing.plan];
    const proratedAmount = calculateProratedAmount(billing, newPlan);
    
    billing.plan = newPlanType;
    billing.monthlyCharge = newPlan.monthlyPrice;
    billing.features = { ...newPlan.features };
    
    // Create invoice for plan change
    const invoice = {
      invoiceNumber: generateInvoiceNumber(),
      amount: proratedAmount,
      date: new Date(),
      dueDate: new Date(),
      status: 'pending',
      description: `Plan upgrade from ${oldPlan.name} to ${newPlan.name}`
    };
    
    if (!billing.invoices) billing.invoices = [];
    billing.invoices.push(invoice);
    
    await billing.save();
    
    return {
      success: true,
      message: 'Plan updated successfully',
      newPlan: billing.plan,
      proratedAmount: proratedAmount,
      invoice: invoice
    };
  } catch (error) {
    console.error('Error changing plan:', error);
    throw error;
  }
}

// Process monthly billing
async function processMonthlyBilling(pharmacyId) {
  try {
    const billing = await SaasBilling.findOne({ pharmacy: pharmacyId });
    
    if (!billing || billing.status === 'cancelled') {
      return { processed: false, reason: 'Invalid subscription' };
    }
    
    // If in trial, convert to active when trial ends
    if (billing.status === 'trial' && new Date() >= billing.trialEndDate) {
      billing.status = 'active';
    }
    
    // Check if billing date passed
    if (new Date() < billing.nextBillingDate && billing.status !== 'trial') {
      return { processed: false, reason: 'Not ready for billing' };
    }
    
    // Create invoice
    const amount = billing.billingCycle === 'annual' 
      ? billing.monthlyCharge * 12 * (1 - billing.annualDiscount / 100)
      : billing.monthlyCharge;
    
    const invoice = {
      invoiceNumber: generateInvoiceNumber(),
      amount: amount,
      date: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
      status: 'pending',
      pdfUrl: `/invoices/${generateInvoiceNumber()}.pdf`
    };
    
    try {
      // TODO: Process payment with payment gateway (Razorpay, Stripe, etc.)
      invoice.status = 'paid';
      invoice.paidDate = new Date();
      billing.failedPaymentAttempts = 0;
      billing.lastPaymentDate = new Date();
    } catch (error) {
      // Payment failed
      invoice.status = 'failed';
      billing.failedPaymentAttempts = (billing.failedPaymentAttempts || 0) + 1;
      
      if (billing.failedPaymentAttempts >= 3) {
        billing.status = 'past_due';
        // TODO: Send email notification
      }
    }
    
    if (!billing.invoices) billing.invoices = [];
    billing.invoices.push(invoice);
    
    // Set next billing date
    const nextBilling = new Date(billing.nextBillingDate);
    if (billing.billingCycle === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }
    billing.nextBillingDate = nextBilling;
    
    await billing.save();
    
    return {
      processed: true,
      invoice: invoice,
      nextBillingDate: nextBilling,
      status: billing.status
    };
  } catch (error) {
    console.error('Error processing billing:', error);
    throw error;
  }
}

// Cancel subscription
async function cancelSubscription(pharmacyId, reason = '') {
  try {
    const billing = await SaasBilling.findOne({ pharmacy: pharmacyId });
    
    if (!billing) {
      throw new Error('Subscription not found');
    }
    
    billing.status = 'cancelled';
    billing.subscriptionEndDate = new Date();
    billing.notes = reason;
    
    await billing.save();
    
    return {
      success: true,
      message: 'Subscription cancelled',
      cancelledDate: billing.subscriptionEndDate
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

// Get billing history
async function getBillingHistory(pharmacyId, limit = 12) {
  try {
    const billing = await SaasBilling.findOne({ pharmacy: pharmacyId });
    
    if (!billing) {
      return [];
    }
    
    return billing.invoices
      ?.sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit) || [];
  } catch (error) {
    console.error('Error getting billing history:', error);
    throw error;
  }
}

// Get all plans
function getAllPlans() {
  return Object.keys(PLANS).map(key => ({
    id: key,
    ...PLANS[key]
  }));
}

// Helper functions
function calculateProratedAmount(billing, newPlan) {
  const daysLeft = Math.ceil((billing.nextBillingDate - new Date()) / (1000 * 60 * 60 * 24));
  const daysInBillingCycle = billing.billingCycle === 'monthly' ? 30 : 365;
  const dailyOldRate = billing.monthlyCharge / daysInBillingCycle;
  const oldAmount = dailyOldRate * daysLeft;
  const dailyNewRate = (newPlan.monthlyPrice || newPlan.monthlyPrice) / daysInBillingCycle;
  const newAmount = dailyNewRate * daysLeft;
  
  return Math.round((newAmount - oldAmount) * 100) / 100;
}

function generateInvoiceNumber() {
  const date = new Date();
  const randomNum = Math.floor(Math.random() * 10000);
  return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${randomNum}`;
}

// Update API usage
async function updateAPIUsage(pharmacyId, apiCalls) {
  try {
    const billing = await SaasBilling.findOne({ pharmacy: pharmacyId });
    
    if (!billing) {
      throw new Error('Subscription not found');
    }
    
    billing.currentUsage.apiCallsThisMonth += apiCalls;
    
    // Check if exceeded limit
    if (billing.currentUsage.apiCallsThisMonth > billing.features.apiCallsPerMonth) {
      // Can implement overages charge here
      billing.currentUsage.apiCallsThisMonth = billing.features.apiCallsPerMonth;
    }
    
    await billing.save();
    
    return {
      currentUsage: billing.currentUsage.apiCallsThisMonth,
      limit: billing.features.apiCallsPerMonth,
      percentage: (billing.currentUsage.apiCallsThisMonth / billing.features.apiCallsPerMonth) * 100
    };
  } catch (error) {
    console.error('Error updating API usage:', error);
    throw error;
  }
}

module.exports = {
  createSubscription,
  getSubscription,
  changePlan,
  processMonthlyBilling,
  cancelSubscription,
  getBillingHistory,
  getAllPlans,
  updateAPIUsage,
  PLANS
};
