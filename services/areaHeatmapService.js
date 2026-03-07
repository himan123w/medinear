const Reservation = require('../models/Reservation');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');

/**
 * Auto Area Heatmap Service
 * Generates visualization data for:
 * - 🔥 High demand zones
 * - 🟢 Well stocked zones
 * - ⚠️ Shortage areas
 * 
 * Use cases:
 * - Pharmacy analytics
 * - Expansion planning
 * - Investor presentations
 */

// Get comprehensive area heatmap data
async function getAreaHeatmap() {
  try {
    // Get all pharmacies with their locations
    const pharmacies = await Pharmacy.find({ verified: true })
      .select('name area city location address');
    
    // Get reservations from last 30 days (demand indicator)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const reservations = await Reservation.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('pharmacy', 'area city');
    
    // Get all medicines with stock info
    const medicines = await Medicine.find({}).populate('pharmacy', 'area city');
    
    // Aggregate data by area
    const areaStats = {};
    
    // Process pharmacies
    pharmacies.forEach(pharmacy => {
      const areaKey = `${pharmacy.city}_${pharmacy.area}`;
      if (!areaStats[areaKey]) {
        areaStats[areaKey] = {
          area: pharmacy.area,
          city: pharmacy.city,
          location: pharmacy.location,
          pharmacies: [],
          pharmacyCount: 0,
          totalDemand: 0,
          totalStock: 0,
          totalReservations: 0,
          lowStockCount: 0,
          medicines: new Set()
        };
      }
      areaStats[areaKey].pharmacies.push({
        id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address
      });
      areaStats[areaKey].pharmacyCount++;
    });
    
    // Process reservations (demand indicator)
    reservations.forEach(reservation => {
      if (reservation.pharmacy) {
        const areaKey = `${reservation.pharmacy.city}_${reservation.pharmacy.area}`;
        if (areaStats[areaKey]) {
          areaStats[areaKey].totalReservations++;
          areaStats[areaKey].totalDemand += reservation.quantity || 1;
        }
      }
    });
    
    // Process medicines (stock indicator)
    medicines.forEach(medicine => {
      if (medicine.pharmacy) {
        const areaKey = `${medicine.pharmacy.city}_${medicine.pharmacy.area}`;
        if (areaStats[areaKey]) {
          areaStats[areaKey].totalStock += medicine.stock || 0;
          areaStats[areaKey].medicines.add(medicine.name);
          if (medicine.stock < 10) {
            areaStats[areaKey].lowStockCount++;
          }
        }
      }
    });
    
    // Calculate zone classifications
    const zones = Object.keys(areaStats).map(key => {
      const stats = areaStats[key];
      const demandPerPharmacy = stats.pharmacyCount > 0 ? stats.totalDemand / stats.pharmacyCount : 0;
      const stockPerPharmacy = stats.pharmacyCount > 0 ? stats.totalStock / stats.pharmacyCount : 0;
      const demandToStockRatio = stats.totalStock > 0 ? stats.totalDemand / stats.totalStock : 0;
      
      // Classify zone
      let zoneType = 'normal';
      let severity = 'low';
      let icon = '🟢';
      let color = '#51cf66';
      let bgColor = '#f3faf3';
      let recommendation = 'Area is well balanced';
      
      // High demand zone (lots of activity)
      if (demandPerPharmacy > 50) {
        zoneType = 'high-demand';
        severity = 'high';
        icon = '🔥';
        color = '#ff6b6b';
        bgColor = '#fff2f2';
        recommendation = 'High demand area - consider opening new pharmacy or increasing stock';
      }
      // Well stocked zone (good inventory)
      else if (stockPerPharmacy > 500 && stats.lowStockCount < 5) {
        zoneType = 'well-stocked';
        severity = 'low';
        icon = '🟢';
        color = '#51cf66';
        bgColor = '#f3faf3';
        recommendation = 'Well stocked area - maintain current levels';
      }
      // Shortage zone (high demand but low stock)
      else if (demandToStockRatio > 0.5 || stats.lowStockCount > 10) {
        zoneType = 'shortage';
        severity = 'medium';
        icon = '⚠️';
        color = '#ffd43b';
        bgColor = '#fffbef';
        recommendation = 'Stock shortage detected - increase inventory levels urgently';
      }
      
      return {
        area: stats.area,
        city: stats.city,
        location: stats.location,
        pharmacies: stats.pharmacies,
        zoneType,
        severity,
        icon,
        color,
        bgColor,
        metrics: {
          pharmacyCount: stats.pharmacyCount,
          totalDemand: stats.totalDemand,
          totalStock: stats.totalStock,
          totalReservations: stats.totalReservations,
          lowStockCount: stats.lowStockCount,
          uniqueMedicines: stats.medicines.size,
          demandPerPharmacy: Math.round(demandPerPharmacy),
          stockPerPharmacy: Math.round(stockPerPharmacy),
          demandToStockRatio: parseFloat(demandToStockRatio.toFixed(2))
        },
        recommendation
      };
    });
    
    // Sort by severity (high demand first, then shortages, then well-stocked)
    zones.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    
    // Calculate summary statistics
    const summary = {
      totalZones: zones.length,
      highDemandZones: zones.filter(z => z.zoneType === 'high-demand').length,
      wellStockedZones: zones.filter(z => z.zoneType === 'well-stocked').length,
      shortageZones: zones.filter(z => z.zoneType === 'shortage').length,
      normalZones: zones.filter(z => z.zoneType === 'normal').length,
      totalPharmacies: Object.values(areaStats).reduce((sum, stat) => sum + stat.pharmacyCount, 0),
      totalReservations: Object.values(areaStats).reduce((sum, stat) => sum + stat.totalReservations, 0),
      totalDemand: Object.values(areaStats).reduce((sum, stat) => sum + stat.totalDemand, 0),
      totalStock: Object.values(areaStats).reduce((sum, stat) => sum + stat.totalStock, 0),
      topDemandZone: zones[0] || null,
      criticalShortages: zones.filter(z => z.zoneType === 'shortage' && z.severity === 'high')
    };
    
    return {
      success: true,
      summary,
      zones,
      timestamp: new Date(),
      period: '30 days',
      dataPoints: {
        pharmacies: pharmacies.length,
        reservations: reservations.length,
        medicines: medicines.length
      }
    };
  } catch (error) {
    console.error('Error generating area heatmap:', error);
    throw error;
  }
}

// Get heatmap for specific city
async function getCityHeatmap(city) {
  try {
    const fullHeatmap = await getAreaHeatmap();
    const cityZones = fullHeatmap.zones.filter(z => 
      z.city.toLowerCase() === city.toLowerCase()
    );
    
    return {
      success: true,
      city,
      zones: cityZones,
      summary: {
        totalZones: cityZones.length,
        highDemandZones: cityZones.filter(z => z.zoneType === 'high-demand').length,
        wellStockedZones: cityZones.filter(z => z.zoneType === 'well-stocked').length,
        shortageZones: cityZones.filter(z => z.zoneType === 'shortage').length
      },
      timestamp: fullHeatmap.timestamp
    };
  } catch (error) {
    console.error('Error generating city heatmap:', error);
    throw error;
  }
}

// Get zones that need attention (high demand or shortage)
async function getCriticalZones() {
  try {
    const heatmap = await getAreaHeatmap();
    const criticalZones = heatmap.zones.filter(z => 
      z.zoneType === 'high-demand' || z.zoneType === 'shortage'
    );
    
    return {
      success: true,
      criticalZones,
      count: criticalZones.length,
      recommendations: criticalZones.map(z => ({
        zone: `${z.area}, ${z.city}`,
        type: z.zoneType,
        severity: z.severity,
        icon: z.icon,
        recommendation: z.recommendation,
        metrics: z.metrics
      }))
    };
  } catch (error) {
    console.error('Error getting critical zones:', error);
    throw error;
  }
}

module.exports = {
  getAreaHeatmap,
  getCityHeatmap,
  getCriticalZones
};
