/**
 * Tests for MetricsTelemetryAdapter
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MetricsTelemetryAdapter, isTelemetryConfig, createTelemetryAdapter } from './metrics-telemetry';
import type { TelemetryConfig } from './config';

describe('MetricsTelemetryAdapter', () => {
  let config: TelemetryConfig;
  let adapter: MetricsTelemetryAdapter;

  beforeEach(() => {
    config = {
      enabled: true,
      network: 'devnet',
      batchSize: 10,
      flushIntervalMs: 30000,
    };
    adapter = new MetricsTelemetryAdapter(config);
  });

  afterEach(() => {
    adapter.destroy();
  });

  describe('isEnabled', () => {
    it('should return true when enabled', () => {
      expect(adapter.isEnabled()).toBe(true);
    });

    it('should return false when disabled', () => {
      const disabledAdapter = new MetricsTelemetryAdapter({ enabled: false });
      expect(disabledAdapter.isEnabled()).toBe(false);
      disabledAdapter.destroy();
    });
  });

  describe('increment', () => {
    it('should increment metric by 1 by default', () => {
      adapter.increment('test_metric');
      const metrics = adapter.getMetrics();
      expect(metrics['test_metric']).toBe(1);
    });

    it('should increment metric by specified value', () => {
      adapter.increment('test_metric', 5);
      const metrics = adapter.getMetrics();
      expect(metrics['test_metric']).toBe(5);
    });

    it('should accumulate increments', () => {
      adapter.increment('test_metric');
      adapter.increment('test_metric');
      adapter.increment('test_metric', 3);
      const metrics = adapter.getMetrics();
      expect(metrics['test_metric']).toBe(5);
    });

    it('should not increment when disabled', () => {
      const disabledAdapter = new MetricsTelemetryAdapter({ enabled: false });
      disabledAdapter.increment('test_metric');
      const metrics = disabledAdapter.getMetrics();
      expect(metrics['test_metric']).toBeUndefined();
      disabledAdapter.destroy();
    });
  });

  describe('gauge', () => {
    it('should set gauge value', () => {
      adapter.gauge('test_gauge', 42);
      const metrics = adapter.getMetrics();
      expect(metrics['test_gauge']).toBe(42);
    });

    it('should overwrite previous gauge value', () => {
      adapter.gauge('test_gauge', 10);
      adapter.gauge('test_gauge', 20);
      const metrics = adapter.getMetrics();
      expect(metrics['test_gauge']).toBe(20);
    });
  });

  describe('track', () => {
    it('should increment event counter', () => {
      adapter.track('user_action');
      const metrics = adapter.getMetrics();
      expect(metrics['event_user_action']).toBe(1);
    });

    it('should track numeric properties as gauges', () => {
      adapter.track('page_load', { duration: 150 });
      const metrics = adapter.getMetrics();
      expect(metrics['page_load_duration']).toBe(150);
    });
  });

  describe('error', () => {
    it('should track error with code', () => {
      const error = new Error('Test error') as Error & { code: string };
      error.code = 'USER_REJECTED';
      adapter.error(error);
      const metrics = adapter.getMetrics();
      expect(metrics['error_USER_REJECTED']).toBe(1);
    });

    it('should track error without code as UNKNOWN', () => {
      const error = new Error('Test error');
      adapter.error(error);
      const metrics = adapter.getMetrics();
      expect(metrics['error_UNKNOWN']).toBe(1);
    });
  });

  describe('flush', () => {
    it('should do nothing without endpoint', async () => {
      adapter.increment('test_metric');
      // Should not throw
      await adapter.flush();
    });

    it('should send metrics to endpoint', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = fetchMock;

      const adapterWithEndpoint = new MetricsTelemetryAdapter({
        enabled: true,
        network: 'devnet',
        endpoint: 'https://metrics.example.com/events',
      });

      adapterWithEndpoint.increment('test_metric');
      await adapterWithEndpoint.flush();

      expect(fetchMock).toHaveBeenCalledWith(
        'https://metrics.example.com/events',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      adapterWithEndpoint.destroy();
    });

    it('should silently fail on network error', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = fetchMock;

      const adapterWithEndpoint = new MetricsTelemetryAdapter({
        enabled: true,
        network: 'devnet',
        endpoint: 'https://metrics.example.com/events',
      });

      adapterWithEndpoint.increment('test_metric');
      // Should not throw
      await adapterWithEndpoint.flush();

      adapterWithEndpoint.destroy();
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      adapter.increment('metric1');
      adapter.increment('metric2');
      adapter.gauge('metric3', 100);

      adapter.reset();

      const metrics = adapter.getMetrics();
      expect(Object.keys(metrics).length).toBe(0);
    });
  });

  describe('sampling', () => {
    it('should respect sample rate', () => {
      const sampledAdapter = new MetricsTelemetryAdapter({
        enabled: true,
        sampleRate: 0, // 0% sampling = no events
      });

      sampledAdapter.increment('test_metric');
      const metrics = sampledAdapter.getMetrics();
      expect(metrics['test_metric']).toBeUndefined();

      sampledAdapter.destroy();
    });
  });
});

describe('isTelemetryConfig', () => {
  it('should return true for valid TelemetryConfig', () => {
    expect(isTelemetryConfig({ enabled: true })).toBe(true);
    expect(isTelemetryConfig({ enabled: false })).toBe(true);
    expect(isTelemetryConfig({ enabled: true, endpoint: 'https://example.com' })).toBe(true);
  });

  it('should return false for invalid values', () => {
    expect(isTelemetryConfig(null)).toBe(false);
    expect(isTelemetryConfig(undefined)).toBe(false);
    expect(isTelemetryConfig({})).toBe(false);
    expect(isTelemetryConfig({ enabled: 'true' })).toBe(false);
  });

  it('should return false for TelemetryAdapter instances', () => {
    const adapter = {
      track: () => {},
      error: () => {},
    };
    expect(isTelemetryConfig(adapter)).toBe(false);
  });
});

describe('createTelemetryAdapter', () => {
  it('should return undefined for undefined config', () => {
    expect(createTelemetryAdapter(undefined)).toBeUndefined();
  });

  it('should create MetricsTelemetryAdapter for TelemetryConfig', () => {
    const adapter = createTelemetryAdapter({ enabled: true });
    expect(adapter).toBeInstanceOf(MetricsTelemetryAdapter);
    if (adapter && 'destroy' in adapter) {
      (adapter as MetricsTelemetryAdapter).destroy();
    }
  });

  it('should return existing adapter for TelemetryAdapter', () => {
    const existingAdapter = {
      track: () => {},
      error: () => {},
    };
    expect(createTelemetryAdapter(existingAdapter)).toBe(existingAdapter);
  });
});
