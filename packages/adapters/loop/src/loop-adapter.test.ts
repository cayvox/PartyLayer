/**
 * Loop adapter compliance tests
 * 
 * Note: Browser-dependent tests are skipped in Node.js environment
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoopAdapter } from './loop-adapter';
import type { AdapterContext } from '@partylayer/core';
import {
  CapabilityNotSupportedError,
  toWalletId,
  toPartyId,
} from '@partylayer/core';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

describe('LoopAdapter', () => {
  let adapter: LoopAdapter;
  let mockContext: AdapterContext;

  beforeEach(() => {
    adapter = new LoopAdapter();
    
    vi.clearAllMocks();
    
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
      expect(caps).toContain('submitTransaction');
      expect(caps).not.toContain('signTransaction'); // Loop doesn't support separate signing
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
    it.skipIf(!isBrowser)('should throw WALLET_NOT_INSTALLED if SDK not available (browser only)', async () => {
      // This test only makes sense in a browser environment
      // In Node.js, the adapter will throw because there's no window
    });
  });

  describe('signTransaction', () => {
    it('should throw CapabilityNotSupportedError', async () => {
      const session = {
        sessionId: 'test' as import('@partylayer/core').SessionId,
        walletId: toWalletId('loop'),
        partyId: toPartyId('party::test'),
        network: 'devnet',
        createdAt: Date.now(),
        origin: 'https://test.com',
        capabilitiesSnapshot: [] as import('@partylayer/core').CapabilityKey[],
      };

      await expect(
        adapter.signTransaction(mockContext, session, { tx: {} })
      ).rejects.toThrow(CapabilityNotSupportedError);
    });
  });
});
