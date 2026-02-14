/**
 * Metrics Telemetry Adapter
 * 
 * A privacy-safe telemetry adapter that collects metrics for
 * ecosystem health monitoring and usage reporting.
 * 
 * Features:
 * - Opt-in by default (disabled unless explicitly enabled)
 * - Privacy-safe payloads (no PII, hashed identifiers)
 * - Batched sending to reduce network overhead
 * - Configurable sampling rate
 * - Automatic flush on interval or batch size
 * 
 * @since 0.3.0
 */

import type { TelemetryAdapter } from '@partylayer/core';
import {
  createMetricsPayload,
  hashForPrivacy,
} from '@partylayer/core';
import type { TelemetryConfig } from './config';

/** SDK Version - should match package.json */
const SDK_VERSION = '0.3.0';

/**
 * Internal metric event for buffering
 */
interface MetricEvent {
  type: 'increment' | 'gauge';
  metric: string;
  value: number;
  timestamp: number;
}

/**
 * Metrics Telemetry Adapter
 * 
 * Implements TelemetryAdapter interface with metrics-specific functionality.
 */
export class MetricsTelemetryAdapter implements TelemetryAdapter {
  private config: TelemetryConfig;
  private metrics: Map<string, number> = new Map();
  private buffer: MetricEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private appIdHash: string | null = null;
  private originHash: string | null = null;
  private initialized = false;
  
  constructor(config: TelemetryConfig) {
    this.config = {
      enabled: config.enabled ?? false,
      endpoint: config.endpoint,
      sampleRate: config.sampleRate ?? 1.0,
      appId: config.appId,
      includeOrigin: config.includeOrigin ?? false,
      batchSize: config.batchSize ?? 10,
      flushIntervalMs: config.flushIntervalMs ?? 30000,
      network: config.network,
    };
    
    // Initialize async hashing
    this.initialize();
  }
  
  /**
   * Initialize async components (hashing)
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.config.appId) {
      this.appIdHash = await hashForPrivacy(this.config.appId);
    }
    
    if (this.config.includeOrigin && typeof window !== 'undefined') {
      this.originHash = await hashForPrivacy(window.location.origin);
    }
    
    // Start flush timer
    if (this.config.enabled && this.config.flushIntervalMs) {
      this.flushTimer = setInterval(() => {
        this.flush().catch(console.error);
      }, this.config.flushIntervalMs);
    }
    
    this.initialized = true;
  }
  
  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
  
  /**
   * Track a named event (TelemetryAdapter interface)
   */
  track(event: string, properties?: Record<string, unknown>): void {
    if (!this.config.enabled) return;
    
    // Apply sampling (sampleRate of 0 means no events, 1 means all events)
    const sampleRate = this.config.sampleRate ?? 1.0;
    if (sampleRate < 1.0 && Math.random() >= sampleRate) {
      return;
    }
    
    // Convert event to increment - bypass the increment sampling since we already checked
    const current = this.metrics.get(`event_${event}`) ?? 0;
    this.metrics.set(`event_${event}`, current + 1);
    this.bufferEvent({ type: 'increment', metric: `event_${event}`, value: 1, timestamp: Date.now() });
    
    // Track any numeric properties as gauges
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (typeof value === 'number') {
          this.gauge(`${event}_${key}`, value);
        }
      }
    }
  }
  
  /**
   * Track an error (TelemetryAdapter interface)
   */
  error(error: Error, properties?: Record<string, unknown>): void {
    if (!this.config.enabled) return;
    
    // Extract error code if available
    const code = (error as { code?: string }).code ?? 'UNKNOWN';
    this.increment(`error_${code}`);
    
    // Track properties
    if (properties) {
      this.track('error', properties);
    }
  }
  
  /**
   * Increment a metric counter
   */
  increment(metric: string, value: number = 1): void {
    if (!this.config.enabled) return;
    
    // Apply sampling (sampleRate of 0 means no events, 1 means all events)
    const sampleRate = this.config.sampleRate ?? 1.0;
    if (sampleRate < 1.0 && Math.random() >= sampleRate) {
      return;
    }
    
    const current = this.metrics.get(metric) ?? 0;
    this.metrics.set(metric, current + value);
    
    this.bufferEvent({
      type: 'increment',
      metric,
      value,
      timestamp: Date.now(),
    });
  }
  
  /**
   * Set a gauge metric value
   */
  gauge(metric: string, value: number): void {
    if (!this.config.enabled) return;
    
    this.metrics.set(metric, value);
    
    this.bufferEvent({
      type: 'gauge',
      metric,
      value,
      timestamp: Date.now(),
    });
  }
  
  /**
   * Buffer an event for batched sending
   */
  private bufferEvent(event: MetricEvent): void {
    this.buffer.push(event);
    
    // Flush if batch size reached
    if (this.config.batchSize && this.buffer.length >= this.config.batchSize) {
      this.flush().catch(console.error);
    }
  }
  
  /**
   * Flush buffered metrics to backend
   */
  async flush(): Promise<void> {
    if (!this.config.enabled) return;
    if (this.metrics.size === 0) return;
    if (!this.config.endpoint) {
      // No endpoint configured - just clear the buffer
      this.buffer = [];
      return;
    }
    
    // Wait for initialization
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      const payload = createMetricsPayload({
        sdkVersion: SDK_VERSION,
        network: this.config.network ?? 'unknown',
        metrics: Object.fromEntries(this.metrics),
        appIdHash: this.appIdHash ?? undefined,
        originHash: this.originHash ?? undefined,
      });
      
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      // Clear buffer on success
      this.buffer = [];
      // Note: We don't clear metrics - they accumulate until next flush
      // This allows calculating rates (e.g., errors per session)
    } catch (error) {
      // Silent fail - don't break the app for telemetry failures
      console.debug('[PartyLayer Telemetry] Flush failed:', error);
    }
  }
  
  /**
   * Get current metrics snapshot (for testing/debugging)
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
  
  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.metrics.clear();
    this.buffer = [];
  }
  
  /**
   * Destroy the adapter (cleanup timers)
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Final flush
    this.flush().catch(console.error);
  }
}

/**
 * Check if a value is a TelemetryConfig object
 */
export function isTelemetryConfig(value: unknown): value is TelemetryConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'enabled' in value &&
    typeof (value as TelemetryConfig).enabled === 'boolean'
  );
}

/**
 * Create a TelemetryAdapter from config
 * 
 * If config is already a TelemetryAdapter, returns it.
 * If config is a TelemetryConfig, creates a MetricsTelemetryAdapter.
 */
export function createTelemetryAdapter(
  config: TelemetryAdapter | TelemetryConfig | undefined
): TelemetryAdapter | undefined {
  if (!config) return undefined;
  
  if (isTelemetryConfig(config)) {
    return new MetricsTelemetryAdapter(config);
  }
  
  return config;
}
