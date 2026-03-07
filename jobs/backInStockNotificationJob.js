const cron = require('node-cron');
const backInStockService = require('../services/backInStockNotificationService');

let backInStockJob = null;
let cleanupJob = null;

/**
 * Initialize back-in-stock notification jobs
 * Runs every 4 hours to check for stock improvements
 * Runs daily to clean up expired subscriptions
 */
function initializeBackInStockJobs() {
  try {
    console.log('🔔 Initializing back-in-stock notification jobs...');

    // Main notification check job - runs every 4 hours (0 */4 * * *)
    backInStockJob = cron.schedule('0 */4 * * *', async () => {
      console.log('⏰ Running back-in-stock notification check...');
      try {
        const stats = await backInStockService.checkAndNotifyOutOfStock();
        const serviceStats = await backInStockService.getServiceStats();
        
        console.log('📊 Notification Service Stats:', serviceStats);
      } catch (error) {
        console.error('❌ Error in back-in-stock notification job:', error);
      }
    });

    // Cleanup job - runs daily at 2 AM (0 2 * * *)
    cleanupJob = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running expired subscription cleanup...');
      try {
        await backInStockService.cleanupExpiredSubscriptions();
      } catch (error) {
        console.error('❌ Error in cleanup job:', error);
      }
    });

    console.log('✓ Back-in-stock notification jobs initialized');
    console.log('  📅 Check job: Every 4 hours (0 */4 * * *)');
    console.log('  🧹 Cleanup job: Daily at 2 AM (0 2 * * *)');

    return { backInStockJob, cleanupJob };
  } catch (error) {
    console.error('Error initializing back-in-stock jobs:', error);
    throw error;
  }
}

/**
 * Stop all back-in-stock notification jobs
 */
function stopBackInStockJobs() {
  try {
    if (backInStockJob) {
      backInStockJob.stop();
      console.log('⏹️  Back-in-stock notification job stopped');
    }

    if (cleanupJob) {
      cleanupJob.stop();
      console.log('⏹️  Cleanup job stopped');
    }
  } catch (error) {
    console.error('Error stopping back-in-stock jobs:', error);
  }
}

/**
 * Run notification check immediately (useful for testing/manual triggering)
 */
async function runImmediateCheck() {
  try {
    console.log('🚀 Running immediate back-in-stock check...');
    const stats = await backInStockService.checkAndNotifyOutOfStock();
    console.log('✓ Immediate check completed:', stats);
    return stats;
  } catch (error) {
    console.error('Error running immediate check:', error);
    throw error;
  }
}

/**
 * Run cleanup immediately
 */
async function runImmediateCleanup() {
  try {
    console.log('🚀 Running immediate cleanup...');
    const result = await backInStockService.cleanupExpiredSubscriptions();
    console.log('✓ Immediate cleanup completed:', result);
    return result;
  } catch (error) {
    console.error('Error running immediate cleanup:', error);
    throw error;
  }
}

module.exports = {
  initializeBackInStockJobs,
  stopBackInStockJobs,
  runImmediateCheck,
  runImmediateCleanup
};
