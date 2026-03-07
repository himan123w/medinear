/**
 * Environment Configuration Validator
 * Validates required environment variables on application startup
 */

const requiredEnvVars = [
  'VITE_API_URL'
];

const optionalEnvVars = {
  VITE_MAP_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  VITE_APP_NAME: 'MediNear',
  VITE_DEFAULT_CITY: 'Delhi'
};

/**
 * Validate environment variables
 * @returns {Object} validation result with missing vars and config
 */
export function validateEnv() {
  const missing = [];
  const config = {};

  // Check required variables
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      missing.push(varName);
    } else {
      config[varName] = value;
    }
  });

  // Set defaults for optional variables
  Object.entries(optionalEnvVars).forEach(([varName, defaultValue]) => {
    config[varName] = import.meta.env[varName] || defaultValue;
  });

  return {
    isValid: missing.length === 0,
    missing,
    config
  };
}

/**
 * Initialize environment configuration
 * Logs warnings for missing variables in development
 */
export function initEnv() {
  const { isValid, missing, config } = validateEnv();

  if (!isValid && import.meta.env.DEV) {
    console.warn('⚠️  Missing environment variables:', missing);
    console.warn('⚠️  These variables should be defined in .env file');
    console.warn('⚠️  Using default values where possible');
  }

  if (import.meta.env.DEV) {
    console.log('🔧 Environment Configuration:', {
      mode: import.meta.env.MODE,
      apiUrl: config.VITE_API_URL,
      appName: config.VITE_APP_NAME
    });
  }

  return config;
}

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable name
 * @param {any} defaultValue - Fallback value if not set
 * @returns {any} Environment value or default
 */
export function getEnv(key, defaultValue = null) {
  return import.meta.env[key] || defaultValue;
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return import.meta.env.DEV;
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return import.meta.env.PROD;
}

export default {
  validateEnv,
  initEnv,
  getEnv,
  isDevelopment,
  isProduction
};
