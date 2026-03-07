/**
 * ⚡ Caching Service for Performance
 * Reduces database hits, improves response time
 */

class CacheManager {
  constructor(defaultTTL = 300) { // 5 minutes default
    this.cache = new Map();
    this.ttl = new Map();
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      reads: 0
    };
  }

  // Set cache with TTL
  set(key, value, ttl = null) {
    const expiryTime = ttl ? Date.now() + ttl * 1000 : Date.now() + this.defaultTTL * 1000;
    
    this.cache.set(key, value);
    this.ttl.set(key, expiryTime);

    // Auto-cleanup on expiry
    if (ttl) {
      setTimeout(() => this.delete(key), ttl * 1000);
    }

    return this;
  }

  // Get cache
  get(key) {
    this.stats.reads++;

    const expiryTime = this.ttl.get(key);
    if (expiryTime && Date.now() > expiryTime) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    if (this.cache.has(key)) {
      this.stats.hits++;
      return this.cache.get(key);
    }

    this.stats.misses++;
    return null;
  }

  // Check if key exists and valid
  has(key) {
    const expiryTime = this.ttl.get(key);
    if (expiryTime && Date.now() > expiryTime) {
      this.delete(key);
      return false;
    }
    return this.cache.has(key);
  }

  // Delete cache
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    return this;
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.ttl.clear();
    return this;
  }

  // Get cache statistics
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      total,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) + '%' : 'N/A',
      size: this.cache.size
    };
  }

  // Reset statistics
  resetStats() {
    this.stats = { hits: 0, misses: 0, reads: 0 };
    return this;
  }
}

// Global cache instances for different data types
const cacheManager = {
  // User data (1 hour TTL)
  users: new CacheManager(3600),
  
  // Medicine data (30 minutes TTL)
  medicines: new CacheManager(1800),
  
  // Pharmacy data (1 hour TTL)
  pharmacies: new CacheManager(3600),
  
  // Analytics (10 minutes TTL)
  analytics: new CacheManager(600),
  
  // AI predictions (2 hours TTL)
  predictions: new CacheManager(7200),
  
  // General purpose (5 minutes TTL)
  general: new CacheManager(300)
};

// Middleware to add cache helpers
const cacheMiddleware = (req, res, next) => {
  // Cache key generator
  res.getCacheKey = () => {
    return `${req.method}:${req.originalUrl}`;
  };

  // Set response cache
  res.cache = (data, ttl = 300, type = 'general') => {
    const key = res.getCacheKey();
    cacheManager[type].set(key, data, ttl);
    return data;
  };

  // Check cache
  res.getCached = (type = 'general') => {
    const key = res.getCacheKey();
    return cacheManager[type].get(key);
  };

  next();
};

// Caching decorator for service methods
function withCache(ttl = 300, cacheType = 'general') {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      // Generate cache key from method name and arguments
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      // Check cache
      const cached = cacheManager[cacheType].get(cacheKey);
      if (cached) {
        console.log(`✅ Cache hit: ${cacheKey}`);
        return cached;
      }

      // Execute method and cache result
      const result = await originalMethod.apply(this, args);
      cacheManager[cacheType].set(cacheKey, result, ttl);
      
      console.log(`💾 Cached: ${cacheKey}`);
      return result;
    };

    return descriptor;
  };
}

module.exports = {
  CacheManager,
  cacheManager,
  cacheMiddleware,
  withCache
};
