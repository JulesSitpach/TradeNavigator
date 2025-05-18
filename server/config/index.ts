/**
 * Configuration Service
 * Centralizes and validates all application configuration
 */

import * as z from 'zod';
import { logger } from '../utils/logger';

// Schema for server configuration
const serverConfigSchema = z.object({
  // Core Server Settings
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),
  API_VERSION: z.string().default('v1'),
  
  // CORS Settings
  CORS_ORIGIN: z.string().default('*'),
  CORS_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  
  // Security Settings
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRY: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(32).optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute
  RATE_LIMIT_MAX: z.coerce.number().default(100), // 100 requests per minute
  
  // Database Settings
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_SSL: z.boolean().default(false),
  DB_CONNECTION_POOL_MAX: z.coerce.number().default(10),
  
  // Cache Settings
  CACHE_TTL: z.coerce.number().default(300), // 5 minutes
  USE_REDIS_CACHE: z.boolean().default(false),
  REDIS_URL: z.string().optional(),
  
  // Monitoring Settings
  ENABLE_METRICS: z.boolean().default(false),
  METRICS_PORT: z.coerce.number().default(9100),
  
  // Feature Flags
  ENABLE_TARIFF_ANALYSIS: z.boolean().default(true),
  ENABLE_ALTERNATIVE_ROUTES: z.boolean().default(true),
  ENABLE_REGULATIONS_DASHBOARD: z.boolean().default(true),
  ENABLE_MARKET_ANALYSIS: z.boolean().default(true),
  ENABLE_AI_PREDICTIONS: z.boolean().default(false),
});

// Schema for external API configuration
const apiConfigSchema = z.object({
  // Exchange Rate API
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  EXCHANGE_RATE_CACHE_TTL: z.coerce.number().default(86400000), // 24 hours
  
  // UN Comtrade API
  UN_COMTRADE_PRIMARY_KEY: z.string().optional(),
  UN_COMTRADE_SECONDARY_KEY: z.string().optional(),
  COMTRADE_CACHE_TTL: z.coerce.number().default(86400000), // 24 hours
  
  // OpenAI API
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo'),
  
  // Shipping API (e.g., Shippo)
  SHIPPO_API_KEY: z.string().optional(),
  
  // Perplexity API
  PERPLEXITY_API_KEY: z.string().optional(),
});

// Schema for circuit breaker configuration
const circuitBreakerConfigSchema = z.object({
  // General Circuit Breaker Settings
  CIRCUIT_BREAKER_ENABLED: z.boolean().default(true),
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: z.coerce.number().default(3),
  CIRCUIT_BREAKER_RESET_TIMEOUT: z.coerce.number().default(30000), // 30 seconds
  CIRCUIT_BREAKER_HALF_OPEN_SUCCESS_THRESHOLD: z.coerce.number().default(2),
  
  // Retry Settings
  MAX_RETRIES: z.coerce.number().default(3),
  RETRY_DELAY: z.coerce.number().default(1000), // 1 second
  API_TIMEOUT: z.coerce.number().default(5000), // 5 seconds
  
  // Service-specific Circuit Breaker Settings (optional overrides)
  EXCHANGE_RATE_API_FAILURE_THRESHOLD: z.coerce.number().optional(),
  EXCHANGE_RATE_API_RESET_TIMEOUT: z.coerce.number().optional(),
  EXCHANGE_RATE_API_MAX_RETRIES: z.coerce.number().optional(),
  
  COMTRADE_API_FAILURE_THRESHOLD: z.coerce.number().optional(),
  COMTRADE_API_RESET_TIMEOUT: z.coerce.number().optional(),
  COMTRADE_API_MAX_RETRIES: z.coerce.number().optional(),
  
  OPENAI_API_FAILURE_THRESHOLD: z.coerce.number().optional(),
  OPENAI_API_RESET_TIMEOUT: z.coerce.number().optional(),
  OPENAI_API_MAX_RETRIES: z.coerce.number().optional(),
});

// Combine all schemas
const configSchema = z.object({
  server: serverConfigSchema,
  api: apiConfigSchema,
  circuitBreaker: circuitBreakerConfigSchema,
});

// Configuration type
type Config = z.infer<typeof configSchema>;

/**
 * Load environment variables and validate them against the schema
 */
function loadConfig(): Config {
  try {
    // Get all environment variables
    const env = process.env;
    
    // Parse and validate server config
    const serverConfig = serverConfigSchema.parse({
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      HOST: env.HOST,
      API_VERSION: env.API_VERSION,
      CORS_ORIGIN: env.CORS_ORIGIN,
      CORS_METHODS: env.CORS_METHODS,
      JWT_SECRET: env.JWT_SECRET,
      JWT_EXPIRY: env.JWT_EXPIRY,
      COOKIE_SECRET: env.COOKIE_SECRET,
      RATE_LIMIT_WINDOW_MS: env.RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX: env.RATE_LIMIT_MAX,
      DATABASE_URL: env.DATABASE_URL,
      DB_HOST: env.DB_HOST,
      DB_PORT: env.DB_PORT,
      DB_USER: env.DB_USER,
      DB_PASSWORD: env.DB_PASSWORD,
      DB_NAME: env.DB_NAME,
      DB_SSL: env.DB_SSL === 'true',
      DB_CONNECTION_POOL_MAX: env.DB_CONNECTION_POOL_MAX,
      CACHE_TTL: env.CACHE_TTL,
      USE_REDIS_CACHE: env.USE_REDIS_CACHE === 'true',
      REDIS_URL: env.REDIS_URL,
      ENABLE_METRICS: env.ENABLE_METRICS === 'true',
      METRICS_PORT: env.METRICS_PORT,
      ENABLE_TARIFF_ANALYSIS: env.ENABLE_TARIFF_ANALYSIS !== 'false',
      ENABLE_ALTERNATIVE_ROUTES: env.ENABLE_ALTERNATIVE_ROUTES !== 'false',
      ENABLE_REGULATIONS_DASHBOARD: env.ENABLE_REGULATIONS_DASHBOARD !== 'false',
      ENABLE_MARKET_ANALYSIS: env.ENABLE_MARKET_ANALYSIS !== 'false',
      ENABLE_AI_PREDICTIONS: env.ENABLE_AI_PREDICTIONS === 'true',
    });
    
    // Parse and validate API config
    const apiConfig = apiConfigSchema.parse({
      EXCHANGE_RATE_API_KEY: env.EXCHANGE_RATE_API_KEY,
      EXCHANGE_RATE_CACHE_TTL: env.EXCHANGE_RATE_CACHE_TTL,
      UN_COMTRADE_PRIMARY_KEY: env.UN_COMTRADE_PRIMARY_KEY,
      UN_COMTRADE_SECONDARY_KEY: env.UN_COMTRADE_SECONDARY_KEY,
      COMTRADE_CACHE_TTL: env.COMTRADE_CACHE_TTL,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      OPENAI_MODEL: env.OPENAI_MODEL,
      SHIPPO_API_KEY: env.SHIPPO_API_KEY,
      PERPLEXITY_API_KEY: env.PERPLEXITY_API_KEY,
    });
    
    // Parse and validate circuit breaker config
    const circuitBreakerConfig = circuitBreakerConfigSchema.parse({
      CIRCUIT_BREAKER_ENABLED: env.CIRCUIT_BREAKER_ENABLED !== 'false',
      CIRCUIT_BREAKER_FAILURE_THRESHOLD: env.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      CIRCUIT_BREAKER_RESET_TIMEOUT: env.CIRCUIT_BREAKER_RESET_TIMEOUT,
      CIRCUIT_BREAKER_HALF_OPEN_SUCCESS_THRESHOLD: env.CIRCUIT_BREAKER_HALF_OPEN_SUCCESS_THRESHOLD,
      MAX_RETRIES: env.MAX_RETRIES,
      RETRY_DELAY: env.RETRY_DELAY,
      API_TIMEOUT: env.API_TIMEOUT,
      EXCHANGE_RATE_API_FAILURE_THRESHOLD: env.EXCHANGE_RATE_API_FAILURE_THRESHOLD,
      EXCHANGE_RATE_API_RESET_TIMEOUT: env.EXCHANGE_RATE_API_RESET_TIMEOUT,
      EXCHANGE_RATE_API_MAX_RETRIES: env.EXCHANGE_RATE_API_MAX_RETRIES,
      COMTRADE_API_FAILURE_THRESHOLD: env.COMTRADE_API_FAILURE_THRESHOLD,
      COMTRADE_API_RESET_TIMEOUT: env.COMTRADE_API_RESET_TIMEOUT,
      COMTRADE_API_MAX_RETRIES: env.COMTRADE_API_MAX_RETRIES,
      OPENAI_API_FAILURE_THRESHOLD: env.OPENAI_API_FAILURE_THRESHOLD,
      OPENAI_API_RESET_TIMEOUT: env.OPENAI_API_RESET_TIMEOUT,
      OPENAI_API_MAX_RETRIES: env.OPENAI_API_MAX_RETRIES,
    });
    
    return {
      server: serverConfig,
      api: apiConfig,
      circuitBreaker: circuitBreakerConfig,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorsFormatted = error.errors.map(e => {
        return `  - ${e.path.join('.')}: ${e.message}`;
      }).join('\n');
      
      logger.error(`Config validation errors:\n${errorsFormatted}`);
      throw new Error(`Configuration validation failed, see logs for details.`);
    }
    
    logger.error('Failed to load configuration:', error);
    throw error;
  }
}

// Create a config service class
class ConfigService {
  private config: Config;
  
  constructor() {
    this.config = loadConfig();
    
    // Log a summarized version of the config (excluding sensitive info)
    this.logConfig();
  }
  
  /**
   * Get the entire config object
   */
  getConfig(): Config {
    return this.config;
  }
  
  /**
   * Get server-specific configuration
   */
  getServerConfig() {
    return this.config.server;
  }
  
  /**
   * Get API-specific configuration
   */
  getApiConfig() {
    return this.config.api;
  }
  
  /**
   * Get circuit breaker configuration
   */
  getCircuitBreakerConfig() {
    return this.config.circuitBreaker;
  }
  
  /**
   * Check if a feature flag is enabled
   */
  isFeatureEnabled(featureName: string): boolean {
    const key = `ENABLE_${featureName.toUpperCase()}` as keyof typeof this.config.server;
    return Boolean(this.config.server[key]);
  }
  
  /**
   * Get service-specific circuit breaker config
   */
  getServiceCircuitBreakerConfig(serviceName: string) {
    const baseConfig = {
      failureThreshold: this.config.circuitBreaker.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      resetTimeout: this.config.circuitBreaker.CIRCUIT_BREAKER_RESET_TIMEOUT,
      halfOpenSuccessThreshold: this.config.circuitBreaker.CIRCUIT_BREAKER_HALF_OPEN_SUCCESS_THRESHOLD,
      maxRetries: this.config.circuitBreaker.MAX_RETRIES,
      retryDelay: this.config.circuitBreaker.RETRY_DELAY,
      timeout: this.config.circuitBreaker.API_TIMEOUT,
    };
    
    // Check for service-specific overrides
    const serviceKey = `${serviceName.toUpperCase()}_API_FAILURE_THRESHOLD` as keyof typeof this.config.circuitBreaker;
    const timeoutKey = `${serviceName.toUpperCase()}_API_RESET_TIMEOUT` as keyof typeof this.config.circuitBreaker;
    const retriesKey = `${serviceName.toUpperCase()}_API_MAX_RETRIES` as keyof typeof this.config.circuitBreaker;
    
    const overrides: Record<string, number> = {};
    
    if (this.config.circuitBreaker[serviceKey]) {
      overrides.failureThreshold = Number(this.config.circuitBreaker[serviceKey]);
    }
    
    if (this.config.circuitBreaker[timeoutKey]) {
      overrides.resetTimeout = Number(this.config.circuitBreaker[timeoutKey]);
    }
    
    if (this.config.circuitBreaker[retriesKey]) {
      overrides.maxRetries = Number(this.config.circuitBreaker[retriesKey]);
    }
    
    return { ...baseConfig, ...overrides };
  }
  
  /**
   * Log a sanitized version of the config for debugging
   */
  private logConfig() {
    const sanitizedConfig = { ...this.config };
    
    // Hide sensitive information
    if (sanitizedConfig.server.JWT_SECRET) {
      sanitizedConfig.server.JWT_SECRET = '[REDACTED]';
    }
    if (sanitizedConfig.server.COOKIE_SECRET) {
      sanitizedConfig.server.COOKIE_SECRET = '[REDACTED]';
    }
    if (sanitizedConfig.server.DB_PASSWORD) {
      sanitizedConfig.server.DB_PASSWORD = '[REDACTED]';
    }
    if (sanitizedConfig.api.EXCHANGE_RATE_API_KEY) {
      sanitizedConfig.api.EXCHANGE_RATE_API_KEY = '[REDACTED]';
    }
    if (sanitizedConfig.api.UN_COMTRADE_PRIMARY_KEY) {
      sanitizedConfig.api.UN_COMTRADE_PRIMARY_KEY = '[REDACTED]';
    }
    if (sanitizedConfig.api.UN_COMTRADE_SECONDARY_KEY) {
      sanitizedConfig.api.UN_COMTRADE_SECONDARY_KEY = '[REDACTED]';
    }
    if (sanitizedConfig.api.OPENAI_API_KEY) {
      sanitizedConfig.api.OPENAI_API_KEY = '[REDACTED]';
    }
    if (sanitizedConfig.api.SHIPPO_API_KEY) {
      sanitizedConfig.api.SHIPPO_API_KEY = '[REDACTED]';
    }
    if (sanitizedConfig.api.PERPLEXITY_API_KEY) {
      sanitizedConfig.api.PERPLEXITY_API_KEY = '[REDACTED]';
    }
    
    logger.info('Application configuration loaded:', sanitizedConfig);
  }
}

// Create and export singleton instance
export const config = new ConfigService();
