/**
 * API Resilience Utilities
 * This module provides circuit breaker and retry patterns for external API calls.
 */

import { logger } from '../logger';
import { metrics } from '../../monitoring/metrics';

// Circuit breaker states
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;      // How many failures before opening the circuit
  resetTimeout: number;          // How long to wait (ms) before moving to half-open
  halfOpenSuccessThreshold: number; // How many successes needed in half-open state to close
  maxRetries: number;            // Maximum number of retry attempts
  retryDelay: number;            // Delay between retries (ms)
  timeout: number;               // Timeout for API calls (ms)
}

// Default options
const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 3,
  resetTimeout: 30000, // 30 seconds
  halfOpenSuccessThreshold: 2,
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  timeout: 5000, // 5 seconds
};

/**
 * Circuit breaker class for managing API call resilience
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private readonly options: CircuitBreakerOptions;
  private services: Record<string, {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    nextAttempt: number;
  }> = {};

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Execute a function with circuit breaker protection
   * @param fn The function to execute
   * @param serviceName Optional service name for tracking multiple dependencies
   * @returns The result of the function
   */
  async execute<T>(fn: () => Promise<T>, serviceName?: string): Promise<T> {
    const serviceId = serviceName || 'default';
    const service = serviceName 
      ? this.getServiceState(serviceName) 
      : { 
          state: this.state, 
          failureCount: this.failureCount,
          successCount: this.successCount,
          nextAttempt: this.nextAttempt
        };

    // Check if circuit is open
    if (service.state === 'OPEN') {
      if (Date.now() < service.nextAttempt) {
        logger.warn(`Circuit OPEN for service ${serviceName || 'default'} - fast failing`);
        metrics.recordExternalApiError(serviceId, 'execute', 'circuit_open');
        throw new Error(`Service ${serviceName || 'default'} unavailable - circuit open`);
      }
      
      // Move to half-open state to test if the service has recovered
      this.setServiceState(serviceName, 'HALF_OPEN', service.failureCount, 0, Date.now());
      logger.info(`Circuit moved to HALF_OPEN for service ${serviceName || 'default'}`);
    }

    // Measure execution time for metrics
    const startTime = Date.now();
    let success = false;

    try {
      // Attempt to execute with retry logic
      const result = await this.executeWithRetry(fn);
      success = true;
      
      // Record successful API request
      const duration = (Date.now() - startTime) / 1000; // Convert to seconds
      metrics.observeExternalApiRequest(serviceId, 'execute', duration, 'success');
      
      // If successful and in half-open state, increment success count
      if (service.state === 'HALF_OPEN') {
        const newSuccessCount = service.successCount + 1;
        
        // If we've reached the success threshold, close the circuit
        if (newSuccessCount >= this.options.halfOpenSuccessThreshold) {
          this.setServiceState(serviceName, 'CLOSED', 0, 0, 0);
          logger.info(`Circuit CLOSED for service ${serviceName || 'default'} after successful recovery`);
        } else {
          // Otherwise, update the success count
          this.setServiceState(serviceName, 'HALF_OPEN', service.failureCount, newSuccessCount, service.nextAttempt);
        }
      } else if (service.state === 'CLOSED' && service.failureCount > 0) {
        // Reset failure count on success in closed state
        this.setServiceState(serviceName, 'CLOSED', 0, 0, 0);
      }
      
      return result;
    } catch (error) {
      // Record failed API request
      const duration = (Date.now() - startTime) / 1000; // Convert to seconds
      metrics.observeExternalApiRequest(serviceId, 'execute', duration, 'error');
      metrics.recordExternalApiError(serviceId, 'execute', error.name || 'unknown_error');
      
      // Handle failure based on circuit state
      const newFailureCount = service.failureCount + 1;
      
      if (service.state === 'CLOSED' && newFailureCount >= this.options.failureThreshold) {
        // Open the circuit after too many failures
        const nextAttemptTime = Date.now() + this.options.resetTimeout;
        this.setServiceState(serviceName, 'OPEN', newFailureCount, 0, nextAttemptTime);
        logger.error(`Circuit OPENED for service ${serviceName || 'default'} after ${newFailureCount} failures`);
      } else if (service.state === 'HALF_OPEN') {
        // If failed in half-open state, go back to open
        const nextAttemptTime = Date.now() + this.options.resetTimeout;
        this.setServiceState(serviceName, 'OPEN', newFailureCount, 0, nextAttemptTime);
        logger.error(`Circuit returned to OPEN for service ${serviceName || 'default'} after failure in half-open state`);
      } else {
        // Update failure count
        this.setServiceState(serviceName, service.state, newFailureCount, service.successCount, service.nextAttempt);
      }
      
      throw error;
    }
  }

  /**
   * Execute a function with retry logic
   * @param fn The function to execute
   * @returns The result of the function
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        // Add timeout handling
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timed out after ${this.options.timeout}ms`));
          }, this.options.timeout);
        });

        // Race the function against the timeout
        const result = await Promise.race([fn(), timeoutPromise]) as T;
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.options.maxRetries) {
          logger.warn(`API call failed (attempt ${attempt + 1}/${this.options.maxRetries + 1}), retrying in ${this.options.retryDelay}ms`, error);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
    logger.error(`API call failed after ${this.options.maxRetries + 1} attempts`, lastError);
    throw lastError;
  }

  /**
   * Reset the circuit breaker state
   * @param serviceName Optional service name
   */
  reset(serviceName?: string): void {
    this.setServiceState(serviceName, 'CLOSED', 0, 0, 0);
    logger.info(`Circuit reset for service ${serviceName || 'default'}`);
  }

  /**
   * Get the current state of the circuit
   * @param serviceName Optional service name
   */
  getState(serviceName?: string): CircuitState {
    return serviceName
      ? this.getServiceState(serviceName).state
      : this.state;
  }

  /**
   * Get service state (internal helper)
   */
  private getServiceState(serviceName: string) {
    if (!this.services[serviceName]) {
      this.services[serviceName] = {
        state: 'CLOSED',
        failureCount: 0,
        successCount: 0,
        nextAttempt: 0
      };
    }
    return this.services[serviceName];
  }

  /**
   * Set service state (internal helper)
   */
  private setServiceState(
    serviceName: string | undefined, 
    state: CircuitState, 
    failureCount: number, 
    successCount: number, 
    nextAttempt: number
  ) {
    if (serviceName) {
      if (!this.services[serviceName]) {
        this.services[serviceName] = {
          state: 'CLOSED',
          failureCount: 0,
          successCount: 0,
          nextAttempt: 0
        };
      }
      // Update metrics if state changed
      if (this.services[serviceName].state !== state) {
        metrics.updateCircuitBreakerState(serviceName, state);
      }
      this.services[serviceName].state = state;
      this.services[serviceName].failureCount = failureCount;
      this.services[serviceName].successCount = successCount;
      this.services[serviceName].nextAttempt = nextAttempt;
    } else {
      // Update metrics if state changed
      if (this.state !== state) {
        metrics.updateCircuitBreakerState('default', state);
      }
      this.state = state;
      this.failureCount = failureCount;
      this.successCount = successCount;
      this.nextAttempt = nextAttempt;
    }
  }
}

// Create a singleton instance with default settings
export const globalCircuitBreaker = new CircuitBreaker();

/**
 * Create a resilient API client with circuit breaker and retry capabilities
 * @param baseApi The base API client or function to wrap
 * @param serviceName Optional service name for tracking
 * @param options Circuit breaker options
 * @returns A wrapped API client with resilience patterns
 */
export function createResilientClient<T extends Record<string, Function>>(
  baseApi: T,
  serviceName?: string,
  options?: Partial<CircuitBreakerOptions>
): T {
  const circuitBreaker = new CircuitBreaker(options);
  const resilientApi = {} as T;

  // Wrap each method in the API with circuit breaker protection
  for (const key of Object.keys(baseApi)) {
    if (typeof baseApi[key] === 'function') {
      resilientApi[key] = async (...args: any[]) => {
        return await circuitBreaker.execute(
          () => baseApi[key](...args),
          serviceName ? `${serviceName}.${key}` : key
        );
      };
    } else {
      resilientApi[key] = baseApi[key];
    }
  }

  return resilientApi;
}

/**
 * Create a resilient fetch function with circuit breaker and retry capabilities
 * @param serviceName The name of the service being called
 * @param options Circuit breaker options
 * @returns A wrapped fetch function
 */
export function createResilientFetch(
  serviceName: string,
  options?: Partial<CircuitBreakerOptions>
): typeof fetch {
  const circuitBreaker = new CircuitBreaker(options);
  
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    return await circuitBreaker.execute(
      () => fetch(input, init),
      serviceName
    );
  };
}
