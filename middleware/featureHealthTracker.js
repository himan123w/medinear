const FeatureHealth = require('../models/FeatureHealth');

const FEATURE_DEFINITIONS = [
  { key: 'auth', name: 'Authentication', pattern: /^\/api\/auth(\/|$)/, routePattern: '/api/auth/*' },
  { key: 'pharmacy', name: 'Pharmacy', pattern: /^\/api\/pharmacy(\/|$)/, routePattern: '/api/pharmacy/*' },
  { key: 'medicine', name: 'Medicine Search', pattern: /^\/api\/medicine(\/|$)/, routePattern: '/api/medicine/*' },
  { key: 'prescription', name: 'Prescription Upload', pattern: /^\/api\/prescription(\/|$)/, routePattern: '/api/prescription/*' },
  { key: 'delivery', name: 'Delivery', pattern: /^\/api\/delivery(\/|$)/, routePattern: '/api/delivery/*' },
  { key: 'reservation', name: 'Reservation', pattern: /^\/api\/reservations(\/|$)/, routePattern: '/api/reservations/*' },
  { key: 'inventory', name: 'Inventory', pattern: /^\/api\/inventory(\/|$)/, routePattern: '/api/inventory/*' },
  { key: 'analytics', name: 'Analytics', pattern: /^\/api\/analytics(\/|$)/, routePattern: '/api/analytics/*' },
  { key: 'rating', name: 'Rating', pattern: /^\/api\/rating(\/|$)/, routePattern: '/api/rating/*' },
  { key: 'subscription', name: 'Subscription', pattern: /^\/api\/subscription(\/|$)/, routePattern: '/api/subscription/*' },
  { key: 'billing', name: 'Billing', pattern: /^\/api\/billing(\/|$)/, routePattern: '/api/billing/*' },
  { key: 'admin', name: 'Admin Panel APIs', pattern: /^\/api\/admin(\/|$)/, routePattern: '/api/admin/*' },
  { key: 'ai_demand', name: 'AI Demand Prediction', pattern: /^\/api\/ai\/demand(\/|$)/, routePattern: '/api/ai/demand/*' }
];

function resolveFeature(path) {
  return FEATURE_DEFINITIONS.find((feature) => feature.pattern.test(path)) || null;
}

function evaluateFeatureStatus(statusCode, successRate, totalHits) {
  if (!totalHits) return 'unknown';
  if (statusCode >= 500 || successRate < 85) return 'critical';
  if (statusCode >= 400 || successRate < 95) return 'warning';
  return 'healthy';
}

function featureHealthTracker(req, res, next) {
  const matchedFeature = resolveFeature(req.path);
  if (!matchedFeature) {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const isSuccess = statusCode < 400;

      const increment = {
        totalHits: 1,
        totalResponseTimeMs: duration,
        successHits: isSuccess ? 1 : 0,
        failureHits: isSuccess ? 0 : 1,
        clientErrorHits: statusCode >= 400 && statusCode < 500 ? 1 : 0,
        serverErrorHits: statusCode >= 500 ? 1 : 0
      };

      const existingMetric = await FeatureHealth.findOne({ featureKey: matchedFeature.key })
        .select('totalHits successHits')
        .lean();

      const projectedTotalHits = (existingMetric?.totalHits || 0) + 1;
      const projectedSuccessHits = (existingMetric?.successHits || 0) + (isSuccess ? 1 : 0);
      const successRate = projectedTotalHits
        ? Number(((projectedSuccessHits / projectedTotalHits) * 100).toFixed(2))
        : 0;

      const featureStatus = evaluateFeatureStatus(statusCode, successRate, projectedTotalHits);

      await FeatureHealth.findOneAndUpdate(
        { featureKey: matchedFeature.key },
        {
          $setOnInsert: {
            featureKey: matchedFeature.key,
            featureName: matchedFeature.name,
            routePattern: matchedFeature.routePattern
          },
          $set: {
            featureName: matchedFeature.name,
            routePattern: matchedFeature.routePattern,
            lastStatusCode: statusCode,
            lastStatus: featureStatus,
            lastErrorMessage: isSuccess ? '' : `HTTP ${statusCode}`,
            lastHitAt: new Date()
          },
          $inc: increment
        },
        { upsert: true }
      );
    } catch (_error) {
      // Monitoring should never block API responses.
    }
  });

  return next();
}

module.exports = {
  featureHealthTracker,
  FEATURE_DEFINITIONS
};