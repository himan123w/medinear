// ===============================
// 🏥 MediNear - Medicine Availability Platform
// Enterprise-Grade Production Server
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ===============================
// Enterprise Middleware Imports
// ===============================
const { validationMiddleware } = require("./middleware/validationMiddleware");
const { apiLimiter, authLimiter, heavyOperationLimiter } = require("./middleware/rateLimitMiddleware");
const { responseFormatterMiddleware } = require("./middleware/responseFormatter");
const { ErrorHandler, asyncHandler, notFoundHandler } = require("./middleware/errorHandler");
const { logger, performanceMonitor, performanceMonitorMiddleware } = require("./services/monitoringService");
const { featureHealthTracker } = require('./middleware/featureHealthTracker');

// ===============================
// Core Middlewares
// ===============================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static("public"));

// ===============================
// Enterprise Security & Performance Middlewares
// ===============================
// 1. Input validation & sanitization
app.use(validationMiddleware);

// 2. Request tracking & performance monitoring
app.use(performanceMonitorMiddleware(logger, performanceMonitor));

// 2.1 Feature-level health tracking persisted in MongoDB
app.use(featureHealthTracker);

// 3. Response formatting (adds helper methods to res object)
app.use(responseFormatterMiddleware);

// 4. Global API rate limiting (applied before auth limiter)
app.use("/api/", apiLimiter);

// ===============================
// MongoDB Connection with Enhanced Logging
// ===============================
if (!process.env.MONGO_URI) {
  console.warn('⚠️  MONGO_URI is not set. Starting server without DB connection (degraded mode).');
} else {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      logger.success('MongoDB Connected Successfully');
      console.log('✅ MongoDB Connected Successfully');
    })
    .catch((err) => {
      logger.error('MongoDB Connection Error', { error: err.message });
      console.error('❌ MongoDB Connection Error:', err.message);
      console.error('The server will continue running but database operations will fail until the DB is available.');
    });
}

// ===============================
// API Routes (with Enterprise Middleware)
// ===============================

// Health check routes (public, no auth needed)
app.use("/api/health", require("./routes/healthRoutes"));

// Auth routes (with specific rate limiting)
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authLimiter, authRoutes);

// Core platform routes
app.use("/api/pharmacy", require("./routes/pharmacyRoutes"));
app.use("/api/medicine", require("./routes/medicineRoutes"));
app.use("/api/prescription", require("./routes/prescriptionRoutes"));
app.use("/api/reminder", require("./routes/reminderRoutes"));
app.use("/api/rating", require("./routes/ratingRoutes"));
app.use("/api/delivery", require("./routes/deliveryRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/ai", require("./routes/visionRoutes"));
app.use("/api/billing", require("./routes/billingRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/stock-notifications", require("./routes/backInStockRoutes"));

// Admin panel routes (protected by adminAuth middleware)
app.use("/api/admin", require("./routes/adminRoutes"));

// B2B SaaS & Enterprise routes
app.use("/api/saas", require("./routes/saasDashboardRoutes"));

// AI Demand Prediction routes (with heavy operation limiting)
app.use("/api/ai/demand", heavyOperationLimiter, require("./routes/demandPredictionRoutes"));

// ===============================
// Scheduled Jobs (Cron)
// ===============================
try {
  const cron = require('node-cron');
  const subscriptionController = require('./controllers/subscriptionController');
  const backInStockJob = require('./jobs/backInStockNotificationJob');

  // Run daily at 02:00 AM server time to process due subscriptions and create deliveries
  cron.schedule('0 2 * * *', async () => {
    logger.info('Cron: Running daily subscription processor');
    console.log('Cron: Running daily subscription processor at', new Date().toISOString());
    try {
      const result = await subscriptionController._processDueSubscriptionsInternal();
      logger.success(`Cron: Processed ${result.count} subscriptions`, { 
        processedIds: result.processedIds.length 
      });
      console.log(`Cron: Processed ${result.count} subscriptions.`, result.processedIds.length ? 'IDs:' + result.processedIds.join(',') : '');
    } catch (err) {
      logger.error('Cron: Error processing subscriptions', { error: err.message });
      console.error('Cron: Error processing subscriptions:', err);
    }
  });

  // Initialize back-in-stock notification jobs
  try {
    backInStockJob.initializeBackInStockJobs();
    logger.success('Back-in-stock notification jobs initialized');
    console.log('✓ Back-in-stock notification jobs initialized');
  } catch (err) {
    logger.error('Error initializing back-in-stock jobs', { error: err.message });
    console.error('Error initializing back-in-stock jobs:', err);
  }
} catch (err) {
  console.warn('Cron scheduling not available (node-cron may not be installed):', err.message);
}

// ===============================
// Default Route
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🏥 MediNear - Medicine Availability Platform API",
    status: "running",
    features: {
      platform: "B2B SaaS Medicine Management",
      ai: "Demand Prediction & Analytics",
      coverage: "Pan-India Pharmacy Network",
      endpoints: "/api/health for system status"
    }
  });
});

// ===============================
// 404 Not Found Handler
// ===============================
app.use(notFoundHandler);

// ===============================
// Global Error Handler Middleware
// ===============================
const errorHandler = new ErrorHandler();
app.use(errorHandler.handle());

// ===============================
// Server Startup with Error Handling
// ===============================
let PORT = Number(process.env.PORT || 5001);
let HOST = process.env.HOST || '127.0.0.1';

let server;

function startServer(port, host = HOST) {
  server = app.listen(port, host, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║  🏥 MediNear - Enterprise Medicine Platform       ║
║  Version: 1.0 | Status: Production Ready          ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  🚀 Server running on port ${port}                     ║
║  🔐 Security: Validation, Rate Limiting Active     ║
║  ⚡ Performance: Caching & Monitoring Active       ║
║  📊 Enterprise: SaaS, AI Predictions Available     ║
║  🏪 Pharmacy Network: Pan-India Coverage           ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  📍 Health Check: GET /api/health                  ║
║  📍 API Status: GET /api/health/services           ║
║  📍 Detailed Status: GET /api/health/detailed      ║
╚════════════════════════════════════════════════════╝
    `);
    
    logger.success('MediNear Server Started Successfully', {
      port: port,
      host: host,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  server.on('error', (err) => {
    if ((err.code === 'EADDRINUSE' || err.code === 'EACCES' || err.code === 'EPERM') && host !== '127.0.0.1') {
      logger.warn(`Bind failed on ${host}:${port}, retrying with localhost`, { error: err.message, port, host });
      console.warn(`⚠️  Binding to ${host}:${port} failed (${err.code}). Retrying with 127.0.0.1:${port}...`);
      startServer(port, '127.0.0.1');
      return;
    }

    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use`, { error: err.message, port });
      console.error(`❌ Port ${port} is already in use.`);
      console.error('Run `npm run restart` to free port 5001 and start the backend again.');
      process.exit(1);
    }

    logger.error('Server error', { error: err.message, stack: err.stack, host });
    console.error('Server error:', err);
  });
}

try {
  startServer(PORT, HOST);
} catch (err) {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
}

// ===============================
// Graceful Shutdown
// ===============================
process.on('SIGTERM', () => {
  logger.warn('SIGTERM signal received: closing HTTP server');
  console.log('SIGTERM signal received: closing HTTP server');
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      console.log('HTTP server closed');
      
      // Close database connection
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        console.log('MongoDB connection closed');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing MongoDB connection', { error: err.message });
        process.exit(1);
      }
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forcing server shutdown after timeout');
      console.error('Forcing server shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
});

// ===============================
// Unhandled Errors & Rejections
// ===============================
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', { promise: String(promise), reason: String(reason) });
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash the process - log and continue
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  console.error('Uncaught Exception thrown:', err);
  // Log the error but try to keep the server running
  // Only exit if it's a critical error
  if (err.code === 'EADDRINUSE' || err.code === 'EACCES' || err.message.includes('FATAL')) {
    console.error('FATAL ERROR - Shutting down');
    process.exit(1);
  }
  // Otherwise, continue running
});