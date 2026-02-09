/**
 * Tests for metrics-payload validation
 */

import { describe, it, expect } from 'vitest';
import {
  validatePayload,
  hashForPrivacy,
  createMetricsPayload,
  type MetricsPayload,
} from './metrics-payload';

describe('validatePayload', () => {
  it('should accept valid payload', () => {
    const payload: MetricsPayload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: Date.now(),
      metrics: {
        wallet_connect_attempts: 10,
        sessions_created: 8,
      },
    };
    expect(validatePayload(payload)).toBe(true);
  });

  it('should accept payload with optional fields', () => {
    const payload: MetricsPayload = {
      sdkVersion: '0.3.0',
      network: 'mainnet',
      timestamp: Date.now(),
      metrics: { test: 1 },
      appIdHash: 'abc123',
      originHash: 'def456',
    };
    expect(validatePayload(payload)).toBe(true);
  });

  it('should reject null', () => {
    expect(validatePayload(null)).toBe(false);
  });

  it('should reject undefined', () => {
    expect(validatePayload(undefined)).toBe(false);
  });

  it('should reject non-object', () => {
    expect(validatePayload('string')).toBe(false);
    expect(validatePayload(123)).toBe(false);
  });

  it('should reject missing sdkVersion', () => {
    const payload = {
      network: 'devnet',
      timestamp: Date.now(),
      metrics: {},
    };
    expect(validatePayload(payload)).toBe(false);
  });

  it('should reject missing network', () => {
    const payload = {
      sdkVersion: '0.3.0',
      timestamp: Date.now(),
      metrics: {},
    };
    expect(validatePayload(payload)).toBe(false);
  });

  it('should reject missing timestamp', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      metrics: {},
    };
    expect(validatePayload(payload)).toBe(false);
  });

  it('should reject invalid timestamp', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: 0,
      metrics: {},
    };
    expect(validatePayload(payload)).toBe(false);
  });

  it('should reject missing metrics', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: Date.now(),
    };
    expect(validatePayload(payload)).toBe(false);
  });

  it('should reject non-numeric metric values', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: Date.now(),
      metrics: { test: 'string' },
    };
    expect(validatePayload(payload)).toBe(false);
  });

  // PII rejection tests
  it('should throw on walletAddress field', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: Date.now(),
      metrics: {},
      walletAddress: '0x123',
    };
    expect(() => validatePayload(payload)).toThrow('Forbidden field detected');
  });

  it('should throw on partyId field', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: Date.now(),
      metrics: {},
      partyId: 'party::alice',
    };
    expect(() => validatePayload(payload)).toThrow('Forbidden field detected');
  });

  it('should throw on email field', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: Date.now(),
      metrics: {},
      email: 'test@example.com',
    };
    expect(() => validatePayload(payload)).toThrow('Forbidden field detected');
  });

  it('should throw on privateKey field', () => {
    const payload = {
      sdkVersion: '0.3.0',
      network: 'devnet',
      timestamp: Date.now(),
      metrics: {},
      privateKey: 'secret',
    };
    expect(() => validatePayload(payload)).toThrow('Forbidden field detected');
  });
});

describe('hashForPrivacy', () => {
  it('should return consistent hash for same input', async () => {
    const hash1 = await hashForPrivacy('test-app');
    const hash2 = await hashForPrivacy('test-app');
    expect(hash1).toBe(hash2);
  });

  it('should return different hash for different input', async () => {
    const hash1 = await hashForPrivacy('app-one');
    const hash2 = await hashForPrivacy('app-two');
    expect(hash1).not.toBe(hash2);
  });

  it('should return hex string', async () => {
    const hash = await hashForPrivacy('test');
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });
});

describe('createMetricsPayload', () => {
  it('should create valid payload', () => {
    const payload = createMetricsPayload({
      sdkVersion: '0.3.0',
      network: 'devnet',
      metrics: { test: 1 },
    });

    expect(payload.sdkVersion).toBe('0.3.0');
    expect(payload.network).toBe('devnet');
    expect(payload.metrics).toEqual({ test: 1 });
    expect(payload.timestamp).toBeGreaterThan(0);
  });

  it('should include optional hashes', () => {
    const payload = createMetricsPayload({
      sdkVersion: '0.3.0',
      network: 'devnet',
      metrics: {},
      appIdHash: 'abc123',
      originHash: 'def456',
    });

    expect(payload.appIdHash).toBe('abc123');
    expect(payload.originHash).toBe('def456');
  });

  it('should validate resulting payload', () => {
    const payload = createMetricsPayload({
      sdkVersion: '0.3.0',
      network: 'devnet',
      metrics: { sessions: 5 },
    });

    expect(validatePayload(payload)).toBe(true);
  });
});
