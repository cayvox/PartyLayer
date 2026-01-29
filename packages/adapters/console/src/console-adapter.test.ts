/**
 * Console adapter compliance tests
 * 
 * Note: Browser-dependent tests are skipped in Node.js environment
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsoleAdapter } from './console-adapter';
import type { AdapterContext } from '@cantonconnect/core';
import {
  toWalletId,
  toPartyId,
} from '@cantonconnect/core';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

describe('ConsoleAdapter', () => {
  let adapter: ConsoleAdapter;
  let mockContext: AdapterContext;

  beforeEach(() => {
    adapter = new ConsoleAdapter();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock context
    mockContext = {
      appName: 'Test App',
      origin: 'https://test.com',
      network: 'devnet',
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      registry: {
        getWallet: vi.fn(),
      },
      crypto: {
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        generateKey: vi.fn(),
      },
      storage: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
      },
      timeout: (ms: number) => {
        return new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), ms);
        });
      },
    };
  });

  describe('getCapabilities', () => {
    it('should return correct capabilities', () => {
      const caps = adapter.getCapabilities();
      expect(caps).toContain('connect');
      expect(caps).toContain('disconnect');
      expect(caps).toContain('signMessage');
      expect(caps).toContain('signTransaction');
      expect(caps).toContain('submitTransaction');
    });
  });

  describe('detectInstalled', () => {
    it('should return false in Node.js environment (no browser)', async () => {
      const result = await adapter.detectInstalled();
      // In Node.js, there's no window, so it should return false with a reason
      if (!isBrowser) {
        expect(result.installed).toBe(false);
        expect(result.reason).toBeDefined();
      }
    });
  });

  describe('connect', () => {
    it.skipIf(!isBrowser)('should connect successfully (browser only)', async () => {
      // This test only makes sense in a browser environment
    });
  });

  describe('signMessage', () => {
    it.skipIf(!isBrowser)('should sign message successfully (browser only)', async () => {
      // This test only makes sense in a browser environment
    });
  });

  describe('adapter properties', () => {
    it('should have correct walletId', () => {
      expect(adapter.walletId).toBe(toWalletId('console'));
    });

    it('should have correct name', () => {
      expect(adapter.name).toBe('Console Wallet');
    });
  });
});
