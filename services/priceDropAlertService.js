const PriceWatch = require('../models/PriceWatch');
const PriceDropAlert = require('../models/PriceDropAlert');
const Pharmacy = require('../models/Pharmacy');

const normalizeQuery = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const shouldMatchMedicine = (watchQuery, medicineName) => {
  const normalizedWatch = normalizeQuery(watchQuery);
  const normalizedMedicine = normalizeQuery(medicineName);

  if (!normalizedWatch || !normalizedMedicine) return false;
  return (
    normalizedMedicine.includes(normalizedWatch) ||
    normalizedWatch.includes(normalizedMedicine)
  );
};

async function trackSearchWatch({
  deviceId,
  searchQuery,
  bestPrice = null,
  latitude = null,
  longitude = null,
  source = 'search'
}) {
  if (!deviceId || !searchQuery) return null;

  const normalizedQuery = normalizeQuery(searchQuery);
  if (!normalizedQuery) return null;

  const existing = await PriceWatch.findOne({ deviceId, normalizedQuery });

  if (!existing) {
    return PriceWatch.create({
      deviceId,
      searchQuery,
      normalizedQuery,
      lastSeenBestPrice: typeof bestPrice === 'number' ? bestPrice : null,
      lastNotifiedPrice: null,
      totalSearches: 1,
      source,
      lastSearchLatitude: latitude,
      lastSearchLongitude: longitude,
      lastSearchedAt: new Date(),
      enabled: true
    });
  }

  existing.searchQuery = searchQuery;
  existing.totalSearches += 1;
  existing.source = source;
  existing.lastSearchLatitude = latitude;
  existing.lastSearchLongitude = longitude;
  existing.lastSearchedAt = new Date();

  if (typeof bestPrice === 'number') {
    existing.lastSeenBestPrice =
      existing.lastSeenBestPrice === null
        ? bestPrice
        : Math.min(existing.lastSeenBestPrice, bestPrice);
  }

  await existing.save();
  return existing;
}

async function triggerPriceDropAlerts({ medicine, oldPrice, newPrice }) {
  if (!medicine || oldPrice === null || oldPrice === undefined) return { alertsCreated: 0 };
  if (typeof newPrice !== 'number' || newPrice >= oldPrice) return { alertsCreated: 0 };

  const medicineName = medicine.name || '';
  if (!medicineName) return { alertsCreated: 0 };

  const watches = await PriceWatch.find({ enabled: true });
  const matchingWatches = watches.filter((watch) => shouldMatchMedicine(watch.normalizedQuery, medicineName));
  if (matchingWatches.length === 0) return { alertsCreated: 0 };

  const pharmacy = await Pharmacy.findById(medicine.pharmacy).select('name');
  const pharmacyName = pharmacy?.name || '';

  let alertsCreated = 0;
  const dropPercent = Number((((oldPrice - newPrice) / oldPrice) * 100).toFixed(2));

  for (const watch of matchingWatches) {
    const duplicateWindowStart = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const existingRecent = await PriceDropAlert.findOne({
      deviceId: watch.deviceId,
      medicine: medicine._id,
      newPrice,
      createdAt: { $gte: duplicateWindowStart }
    });

    if (existingRecent) continue;

    if (watch.lastNotifiedPrice !== null && newPrice >= watch.lastNotifiedPrice) {
      continue;
    }

    await PriceDropAlert.create({
      deviceId: watch.deviceId,
      searchQuery: watch.searchQuery,
      normalizedQuery: watch.normalizedQuery,
      medicine: medicine._id,
      medicineName: medicine.name,
      pharmacy: medicine.pharmacy,
      pharmacyName,
      previousPrice: oldPrice,
      newPrice,
      dropPercent,
      isRead: false,
      alertedAt: new Date()
    });

    watch.lastNotifiedPrice = newPrice;
    watch.lastSeenBestPrice = watch.lastSeenBestPrice === null ? newPrice : Math.min(watch.lastSeenBestPrice, newPrice);
    await watch.save();

    alertsCreated += 1;
  }

  return { alertsCreated };
}

async function getDevicePriceDropAlerts({ deviceId, unreadOnly = false, limit = 20 }) {
  if (!deviceId) return [];

  const query = { deviceId };
  if (unreadOnly) query.isRead = false;

  return PriceDropAlert.find(query)
    .sort({ alertedAt: -1 })
    .limit(Math.min(Number(limit) || 20, 100));
}

async function markAlertAsRead({ deviceId, alertId }) {
  if (!deviceId || !alertId) return null;

  return PriceDropAlert.findOneAndUpdate(
    { _id: alertId, deviceId },
    { $set: { isRead: true } },
    { new: true }
  );
}

async function markAllAlertsAsRead({ deviceId }) {
  if (!deviceId) return { modifiedCount: 0 };
  const result = await PriceDropAlert.updateMany(
    { deviceId, isRead: false },
    { $set: { isRead: true } }
  );

  return { modifiedCount: result.modifiedCount || 0 };
}

module.exports = {
  normalizeQuery,
  trackSearchWatch,
  triggerPriceDropAlerts,
  getDevicePriceDropAlerts,
  markAlertAsRead,
  markAllAlertsAsRead
};
