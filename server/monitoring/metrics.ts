/**
 * Metrics Service
 * Provides Prometheus metrics collection
 */

import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { config } from '../config';

class MetricsService {
  private registry: Registry;
  private initialized: boolean = false;
  
  // HTTP Request metrics
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private httpRequestSizeBytes: Histogram;
  private httpResponseSizeBytes: Histogram;
  
  // Database metrics
  private dbQueryTotal: Counter;
  private dbQueryDuration: Histogram;
  private dbConnectionPoolSize: Gauge;
  private dbConnectionPoolUsed: Gauge;
  
  // API client metrics
  private externalApiRequestsTotal: Counter;
  private externalApiRequestDuration: Histogram;
  private externalApiErrorsTotal: Counter;
  private circuitBreakerState: Gauge;
  
  // Cache metrics
  private cacheHitsTotal: Counter;
  private cacheMissesTotal: Counter;
  private cacheSize: Gauge;
  
  // Application metrics
  private memoryUsageBytes: Gauge;
  private cpuUsagePercent: Gauge;
  private activeConnections: Gauge;
  
  // Business metrics
  private userLoginsTotal: Counter;
  private analysesCreatedTotal: Counter;
  private costBreakdownsCalculatedTotal: Counter;
  private tariffLookupsTotal: Counter;
  
  constructor() {
    this.registry = new Registry();
    
    if (config.getServerConfig().ENABLE_METRICS) {
      this.initializeMetrics();
    }
  }
  
  /**
   * Initialize all metrics
   */
  private initializeMetrics() {
    if (this.initialized) return;
    
    // Register default metrics
    this.registry.setDefaultLabels({
      app: 'trade-navigator',
      environment: config.getServerConfig().NODE_ENV
    });
    
    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status']
    });
    
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
    });
    
    this.httpRequestSizeBytes = new Histogram({
      name: 'http_request_size_bytes',
      help: 'HTTP request size in bytes',
      labelNames: ['method', 'path'],
      buckets: [100, 1000, 10000, 100000, 1000000]
    });
    
    this.httpResponseSizeBytes = new Histogram({
      name: 'http_response_size_bytes',
      help: 'HTTP response size in bytes',
      labelNames: ['method', 'path', 'status'],
      buckets: [100, 1000, 10000, 100000, 1000000]
    });
    
    // Database metrics
    this.dbQueryTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['type', 'table', 'status']
    });
    
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['type', 'table'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
    });
    
    this.dbConnectionPoolSize = new Gauge({
      name: 'db_connection_pool_size',
      help: 'Database connection pool size'
    });
    
    this.dbConnectionPoolUsed = new Gauge({
      name: 'db_connection_pool_used',
      help: 'Database connection pool used connections'
    });
    
    // External API metrics
    this.externalApiRequestsTotal = new Counter({
      name: 'external_api_requests_total',
      help: 'Total number of external API requests',
      labelNames: ['api', 'endpoint', 'status']
    });
    
    this.externalApiRequestDuration = new Histogram({
      name: 'external_api_request_duration_seconds',
      help: 'External API request duration in seconds',
      labelNames: ['api', 'endpoint'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
    });
    
    this.externalApiErrorsTotal = new Counter({
      name: 'external_api_errors_total',
      help: 'Total number of external API errors',
      labelNames: ['api', 'endpoint', 'error_type']
    });
    
    this.circuitBreakerState = new Gauge({
      name: 'circuit_breaker_state',
      help: 'Circuit breaker state (0: closed, 1: half-open, 2: open)',
      labelNames: ['service']
    });
    
    // Cache metrics
    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache']
    });
    
    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache']
    });
    
    this.cacheSize = new Gauge({
      name: 'cache_size',
      help: 'Current cache size',
      labelNames: ['cache']
    });
    
    // Application metrics
    this.memoryUsageBytes = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes'
    });
    
    this.cpuUsagePercent = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage'
    });
    
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections'
    });
    
    // Business metrics
    this.userLoginsTotal = new Counter({
      name: 'user_logins_total',
      help: 'Total number of user logins',
      labelNames: ['status']
    });
    
    this.analysesCreatedTotal = new Counter({
      name: 'analyses_created_total',
      help: 'Total number of analyses created',
      labelNames: ['type']
    });
    
    this.costBreakdownsCalculatedTotal = new Counter({
      name: 'cost_breakdowns_calculated_total',
      help: 'Total number of cost breakdowns calculated'
    });
    
    this.tariffLookupsTotal = new Counter({
      name: 'tariff_lookups_total',
      help: 'Total number of tariff lookups'
    });
    
    // Register all metrics with the registry
    this.registry.registerMetric(this.httpRequestsTotal);
    this.registry.registerMetric(this.httpRequestDuration);
    this.registry.registerMetric(this.httpRequestSizeBytes);
    this.registry.registerMetric(this.httpResponseSizeBytes);
    this.registry.registerMetric(this.dbQueryTotal);
    this.registry.registerMetric(this.dbQueryDuration);
    this.registry.registerMetric(this.dbConnectionPoolSize);
    this.registry.registerMetric(this.dbConnectionPoolUsed);
    this.registry.registerMetric(this.externalApiRequestsTotal);
    this.registry.registerMetric(this.externalApiRequestDuration);
    this.registry.registerMetric(this.externalApiErrorsTotal);
    this.registry.registerMetric(this.circuitBreakerState);
    this.registry.registerMetric(this.cacheHitsTotal);
    this.registry.registerMetric(this.cacheMissesTotal);
    this.registry.registerMetric(this.cacheSize);
    this.registry.registerMetric(this.memoryUsageBytes);
    this.registry.registerMetric(this.cpuUsagePercent);
    this.registry.registerMetric(this.activeConnections);
    this.registry.registerMetric(this.userLoginsTotal);
    this.registry.registerMetric(this.analysesCreatedTotal);
    this.registry.registerMetric(this.costBreakdownsCalculatedTotal);
    this.registry.registerMetric(this.tariffLookupsTotal);
    
    // Start collecting default metrics
    // this.registry.collectDefaultMetrics();
    
    this.initialized = true;
  }
  
  /**
   * Get the Prometheus registry
   */
  getRegistry(): Registry {
    return this.registry;
  }
  
  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    if (!this.initialized) {
      return '';
    }
    
    return await this.registry.metrics();
  }
  
  /**
   * Observe HTTP request
   */
  observeHttpRequest(method: string, path: string, status: number, duration: number, requestSize?: number, responseSize?: number) {
    if (!this.initialized) return;
    
    const labels = { 
      method, 
      path: this.normalizePath(path), 
      status: status.toString() 
    };
    
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, duration);
    
    if (requestSize) {
      this.httpRequestSizeBytes.observe({ method, path: this.normalizePath(path) }, requestSize);
    }
    
    if (responseSize) {
      this.httpResponseSizeBytes.observe(labels, responseSize);
    }
  }
  
  /**
   * Observe database query
   */
  observeDbQuery(type: string, table: string, duration: number, status: 'success' | 'error' = 'success') {
    if (!this.initialized) return;
    
    this.dbQueryTotal.inc({ type, table, status });
    this.dbQueryDuration.observe({ type, table }, duration);
  }
  
  /**
   * Update database connection pool metrics
   */
  updateDbConnectionPool(size: number, used: number) {
    if (!this.initialized) return;
    
    this.dbConnectionPoolSize.set(size);
    this.dbConnectionPoolUsed.set(used);
  }
  
  /**
   * Observe external API request
   */
  observeExternalApiRequest(api: string, endpoint: string, duration: number, status: string) {
    if (!this.initialized) return;
    
    this.externalApiRequestsTotal.inc({ api, endpoint, status });
    this.externalApiRequestDuration.observe({ api, endpoint }, duration);
  }
  
  /**
   * Record external API error
   */
  recordExternalApiError(api: string, endpoint: string, errorType: string) {
    if (!this.initialized) return;
    
    this.externalApiErrorsTotal.inc({ api, endpoint, error_type: errorType });
  }
  
  /**
   * Update circuit breaker state
   */
  updateCircuitBreakerState(service: string, state: 'CLOSED' | 'HALF_OPEN' | 'OPEN') {
    if (!this.initialized) return;
    
    const stateValue = state === 'CLOSED' ? 0 : state === 'HALF_OPEN' ? 1 : 2;
    this.circuitBreakerState.set({ service }, stateValue);
  }
  
  /**
   * Record cache operation
   */
  recordCacheOperation(cacheName: string, hit: boolean) {
    if (!this.initialized) return;
    
    if (hit) {
      this.cacheHitsTotal.inc({ cache: cacheName });
    } else {
      this.cacheMissesTotal.inc({ cache: cacheName });
    }
  }
  
  /**
   * Update cache size
   */
  updateCacheSize(cacheName: string, size: number) {
    if (!this.initialized) return;
    
    this.cacheSize.set({ cache: cacheName }, size);
  }
  
  /**
   * Update application metrics
   */
  updateApplicationMetrics() {
    if (!this.initialized) return;
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    this.memoryUsageBytes.set(memoryUsage.heapUsed);
    
    // CPU usage is more complex and may require additional libraries
    // Left as a placeholder
    // this.cpuUsagePercent.set(cpuUsage);
  }
  
  /**
   * Update active connections
   */
  updateActiveConnections(count: number) {
    if (!this.initialized) return;
    
    this.activeConnections.set(count);
  }
  
  /**
   * Record user login
   */
  recordUserLogin(status: 'success' | 'failure') {
    if (!this.initialized) return;
    
    this.userLoginsTotal.inc({ status });
  }
  
  /**
   * Record analysis creation
   */
  recordAnalysisCreated(type: string) {
    if (!this.initialized) return;
    
    this.analysesCreatedTotal.inc({ type });
  }
  
  /**
   * Record cost breakdown calculation
   */
  recordCostBreakdownCalculated() {
    if (!this.initialized) return;
    
    this.costBreakdownsCalculatedTotal.inc();
  }
  
  /**
   * Record tariff lookup
   */
  recordTariffLookup() {
    if (!this.initialized) return;
    
    this.tariffLookupsTotal.inc();
  }
  
  /**
   * Normalize path to prevent high cardinality in metrics
   */
  private normalizePath(path: string): string {
    // Replace numeric IDs with placeholders to avoid high cardinality
    // Example: /api/users/123 -> /api/users/:id
    return path.replace(/\/\d+/g, '/:id');
  }
}

// Create and export singleton instance
export const metrics = new MetricsService();
