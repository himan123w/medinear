/**
 * 📊 Performance Monitoring & Logging Service
 * Tracks system health and performance metrics
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(logDir = './logs') {
    this.logDir = logDir;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.levels = {
      ERROR: 'ERROR',
      WARN: 'WARN',
      INFO: 'INFO',
      DEBUG: 'DEBUG',
      SUCCESS: 'SUCCESS'
    };

    this.colors = {
      ERROR: '\x1b[31m',    // Red
      WARN: '\x1b[33m',     // Yellow
      INFO: '\x1b[36m',     // Cyan
      DEBUG: '\x1b[35m',    // Magenta
      SUCCESS: '\x1b[32m'   // Green
    };
  }

  // Format log message
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      return `${baseMessage}\n${JSON.stringify(data, null, 2)}`;
    }
    return baseMessage;
  }

  // Write to file
  writeToFile(level, message, data = null) {
    const filename = path.join(this.logDir, `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`);
    const logMessage = this.formatMessage(level, message, data);
    
    fs.appendFileSync(filename, logMessage + '\n\n');
  }

  // Console output
  consoleLog(level, message, data = null) {
    const color = this.colors[level] || '';
    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString();
    const emoji = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍',
      SUCCESS: '✅'
    };

    console.log(`${emoji[level]} ${color}[${timestamp}] [${level}] ${message}${reset}`);
    if (data) {
      console.log(color + JSON.stringify(data, null, 2) + reset);
    }
  }

  // Log methods
  error(message, data = null) {
    this.consoleLog('ERROR', message, data);
    this.writeToFile('ERROR', message, data);
  }

  warn(message, data = null) {
    this.consoleLog('WARN', message, data);
    this.writeToFile('WARN', message, data);
  }

  info(message, data = null) {
    this.consoleLog('INFO', message, data);
    this.writeToFile('INFO', message, data);
  }

  debug(message, data = null) {
    if (process.env.DEBUG === 'true') {
      this.consoleLog('DEBUG', message, data);
      this.writeToFile('DEBUG', message, data);
    }
  }

  success(message, data = null) {
    this.consoleLog('SUCCESS', message, data);
    this.writeToFile('SUCCESS', message, data);
  }
}

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      avgResponseTime: 0,
      errors: 0,
      statusCodes: {},
      slowRequests: [],
      apiCalls: new Map()
    };
  }

  // Track request performance
  trackRequest(method, path, duration, statusCode, error = null) {
    this.metrics.requests++;

    // Track status codes
    if (!this.metrics.statusCodes[statusCode]) {
      this.metrics.statusCodes[statusCode] = 0;
    }
    this.metrics.statusCodes[statusCode]++;

    // Track errors
    if (error) {
      this.metrics.errors++;
    }

    // Track slow requests (> 1000ms)
    if (duration > 1000) {
      this.metrics.slowRequests.push({
        method,
        path,
        duration,
        statusCode,
        timestamp: new Date().toISOString()
      });

      // Keep only last 100
      if (this.metrics.slowRequests.length > 100) {
        this.metrics.slowRequests.shift();
      }
    }

    // Update average response time
    const apiKey = `${method}:${path}`;
    if (!this.metrics.apiCalls.has(apiKey)) {
      this.metrics.apiCalls.set(apiKey, { count: 0, totalTime: 0 });
    }

    const apiMetric = this.metrics.apiCalls.get(apiKey);
    apiMetric.count++;
    apiMetric.totalTime += duration;
  }

  // Get metrics summary
  getMetrics() {
    const totalTime = Array.from(this.metrics.apiCalls.values())
      .reduce((sum, metric) => sum + metric.totalTime, 0);

    const avgResponseTime = this.metrics.requests > 0 
      ? Math.round(totalTime / this.metrics.requests)
      : 0;

    const errorRate = this.metrics.requests > 0
      ? Math.round((this.metrics.errors / this.metrics.requests) * 100)
      : 0;

    return {
      uptime: process.uptime(),
      totalRequests: this.metrics.requests,
      avgResponseTime: `${avgResponseTime}ms`,
      totalErrors: this.metrics.errors,
      errorRate: `${errorRate}%`,
      statusCodes: this.metrics.statusCodes,
      slowRequests: this.metrics.slowRequests.length,
      memoryUsage: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`
      }
    };
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      statusCodes: {},
      slowRequests: [],
      apiCalls: new Map()
    };
  }
}

// Middleware for request logging and performance tracking
const performanceMonitorMiddleware = (logger, monitor) => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Log incoming request
    logger.debug(`Incoming ${req.method} ${req.path}`, {
      query: req.query,
      body: req.body ? Object.keys(req.body) : {}
    });

    // Override res.json to track response
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      const duration = Date.now() - startTime;
      monitor.trackRequest(req.method, req.path, duration, res.statusCode);

      logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);

      return originalJson(data);
    };

    // Track errors
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        monitor.trackRequest(req.method, req.path, Date.now() - startTime, res.statusCode, true);
      }
    });

    next();
  };
};

// Create instances
const logger = new Logger('./logs');
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  Logger,
  PerformanceMonitor,
  logger,
  performanceMonitor,
  performanceMonitorMiddleware
};
