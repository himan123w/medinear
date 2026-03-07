/**
 * Smart Availability Confidence Score Service
 * 
 * Calculates trust-based confidence scores for medicine availability based on:
 * - Last update freshness (recency of data)
 * - Stock quantity remaining
 * - Recent purchase frequency (demand signals)
 */

const mongoose = require('mongoose');

class AvailabilityConfidenceService {
  /**
   * Calculate confidence score (0-100)
   * Factors:
   * - Time Freshness: 0-40 points (how recent is the data?)
   * - Stock Level: 0-35 points (how much inventory?)
   * - Purchase Velocity: 0-25 points (how fast is it selling?)
   */
  static calculateConfidenceScore(medicine) {
    let score = 0;

    // 1️⃣ TIME FRESHNESS FACTOR (0-40 points)
    // More recent updates = higher confidence
    const timeScore = this.calculateTimeScore(medicine.lastRestocked);
    score += timeScore;

    // 2️⃣ STOCK LEVEL FACTOR (0-35 points)
    // More stock = higher confidence
    const stockScore = this.calculateStockScore(medicine.stock, medicine.stockAlert);
    score += stockScore;

    // 3️⃣ PURCHASE VELOCITY FACTOR (0-25 points)
    // Recent sales indicate accuracy and active management
    const velocityScore = this.calculateVelocityScore(
      medicine.recentPurchases || 0,
      medicine.lastRestocked
    );
    score += velocityScore;

    return Math.round(score);
  }

  /**
   * Calculate time freshness score (0-40 points)
   * Recent data is more trustworthy than old data
   */
  static calculateTimeScore(lastRestocked) {
    if (!lastRestocked) return 10; // Low confidence if no timestamp

    const now = new Date();
    const minutesAgo = (now - new Date(lastRestocked)) / (1000 * 60);

    if (minutesAgo < 5) return 40; // Last updated <5 mins = Maximum confidence
    if (minutesAgo < 60) return 35; // Last updated <1 hour = Very high
    if (minutesAgo < 360) return 25; // Last updated <6 hours = Medium-high
    if (minutesAgo < 1440) return 15; // Last updated <24 hours = Medium
    if (minutesAgo < 2880) return 8; // Last updated <2 days = Low
    return 3; // Last updated >2 days = Very low
  }

  /**
   * Calculate stock level score (0-35 points)
   * More inventory = higher confidence in availability
   */
  static calculateStockScore(stock, stockAlert = 10) {
    if (stock === 0) return 0; // Out of stock = no confidence

    // If stock is critically low (below alert threshold)
    if (stock <= stockAlert) return 5; // Low confidence

    if (stock < 20) return 10;
    if (stock < 50) return 18;
    if (stock < 100) return 28;
    return 35; // Rich inventory = high confidence
  }

  /**
   * Calculate purchase velocity score (0-25 points)
   * High recent sales indicate:
   * - Data is actively maintained
   * - Medicine is in real demand
   * - Stock numbers are likely accurate
   */
  static calculateVelocityScore(recentPurchases = 0, lastRestocked) {
    if (recentPurchases === 0) return 8; // Some baseline if no sales

    // Calculate sales velocity (purchases per day)
    let daysActive = 1;
    if (lastRestocked) {
      const now = new Date();
      daysActive = (now - new Date(lastRestocked)) / (1000 * 60 * 60 * 24);
      daysActive = Math.max(1, daysActive); // Minimum 1 day
    }

    const dailyVelocity = recentPurchases / daysActive;

    // Score based on daily sales rate
    if (dailyVelocity >= 10) return 25; // High velocity = very active
    if (dailyVelocity >= 5) return 20; // Medium-high velocity
    if (dailyVelocity >= 2) return 15; // Medium velocity
    if (dailyVelocity >= 1) return 12; // Low-medium velocity
    if (recentPurchases > 0) return 8; // Some activity

    return 3; // Minimal activity
  }

  /**
   * Get availability status with visual indicator
   */
  static getAvailabilityStatus(confidenceScore, stock, stockAlert) {
    // Determine status based on confidence score
    if (confidenceScore >= 80) {
      return {
        icon: '🟢',
        status: 'Available',
        level: 'high',
        message: `High Confidence - ${stock} in stock`
      };
    }

    if (confidenceScore >= 50) {
      // Medium confidence - check if it's low stock or just aging data
      if (stock <= stockAlert) {
        return {
          icon: '🟡',
          status: 'Low Stock',
          level: 'medium',
          message: `Limited availability - Only ${stock} left`
        };
      }
      return {
        icon: '🟡',
        status: 'Available',
        level: 'medium',
        message: `Moderate Confidence - Data may be stale`
      };
    }

    return {
      icon: '🔴',
      status: 'Likely Out of Stock',
      level: 'low',
      message: `Low Confidence - Check with pharmacy`
    };
  }

  /**
   * Build complete availability info for medicine
   */
  static buildAvailabilityInfo(medicine) {
    const confidenceScore = this.calculateConfidenceScore(medicine);
    const availabilityStatus = this.getAvailabilityStatus(
      confidenceScore,
      medicine.stock,
      medicine.stockAlert
    );

    return {
      confidence: {
        score: confidenceScore,
        percentage: `${confidenceScore}%`,
        level: availabilityStatus.level,
        icon: availabilityStatus.icon
      },
      status: availabilityStatus.status,
      message: availabilityStatus.message,
      display: `${availabilityStatus.icon} ${availabilityStatus.status} (${confidenceScore}% confidence)`,
      stock: medicine.stock,
      lastUpdated: medicine.lastRestocked,
      details: {
        timeScore: this.calculateTimeScore(medicine.lastRestocked),
        stockScore: this.calculateStockScore(medicine.stock, medicine.stockAlert),
        velocityScore: this.calculateVelocityScore(
          medicine.recentPurchases || 0,
          medicine.lastRestocked
        )
      }
    };
  }

  /**
   * Record a purchase and update purchase counter
   */
  static async recordPurchase(medicineId, quantity = 1) {
    try {
      const Medicine = mongoose.model('Medicine');
      
      const medicine = await Medicine.findByIdAndUpdate(
        medicineId,
        {
          $inc: { 
            stock: -quantity,
            recentPurchases: 1
          },
          $set: {
            lastRestocked: new Date()
          }
        },
        { new: true }
      );

      return medicine;
    } catch (error) {
      console.error('Error recording purchase:', error);
      throw error;
    }
  }

  /**
   * Reset purchase counter (e.g., weekly) to maintain fresh velocity signals
   */
  static async resetPurchaseCounters() {
    try {
      const Medicine = mongoose.model('Medicine');
      
      await Medicine.updateMany(
        {},
        { $set: { recentPurchases: 0 } }
      );

      console.log('✅ Purchase counters reset');
    } catch (error) {
      console.error('Error resetting purchase counters:', error);
      throw error;
    }
  }

  /**
   * Bulk update stock levels and reset timestamps
   * (Simulating pharmacy inventory checks)
   */
  static async updateStockLevels(medicineUpdates) {
    try {
      const Medicine = mongoose.model('Medicine');
      const results = [];

      for (const update of medicineUpdates) {
        const medicine = await Medicine.findByIdAndUpdate(
          update.medicineId,
          {
            $set: {
              stock: update.stock,
              lastRestocked: new Date()
            }
          },
          { new: true }
        );
        results.push(medicine);
      }

      return results;
    } catch (error) {
      console.error('Error updating stock levels:', error);
      throw error;
    }
  }
}

module.exports = AvailabilityConfidenceService;
