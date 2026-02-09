import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PartyLayerProvider } from '../provider';
import { ProviderRpcError, RPC_ERRORS } from '../errors';
import { CIP0103_EVENTS } from '@partylayer/core';
import type { CIP0103Provider } from '@partylayer/core';
import type { DiscoveredProvider } from '../discovery';

function createMockNativeProvider(
  responses: Record<string, unknown> = {},
): CIP0103Provider {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  const provider: CIP0103Provider = {
    request: vi.fn(async ({ method }) => {
      if (method in responses) return responses[method];
      throw new ProviderRpcError(`Not supported: ${method}`, RPC_ERRORS.UNSUPPORTED_METHOD);
    }),
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
      return provider;
    }),
    emit: vi.fn((event: string, ...args: unknown[]) => {
      const set = listeners.get(event);
      if (!set) return false;
      for (const fn of set) fn(...args);
      return true;
    }),
    removeListener: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      listeners.get(event)?.delete(listener);
      return provider;
    }),
  };

  return provider;
}

function createDiscovered(provider: CIP0103Provider): DiscoveredProvider {
  return {
    id: 'test-wallet',
    provider,
    source: 'injected',
  };
}

describe('PartyLayerProvider', () => {
  describe('CIP-0103 interface', () => {
    it('should implement request()', () => {
      const provider = new PartyLayerProvider();
      expect(typeof provider.request).toBe('function');
    });

    it('should implement on()', () => {
      const provider = new PartyLayerProvider();
      expect(typeof provider.on).toBe('function');
    });

    it('should implement emit()', () => {
      const provider = new PartyLayerProvider();
      expect(typeof provider.emit).toBe('function');
    });

    it('should implement removeListener()', () => {
      const provider = new PartyLayerProvider();
      expect(typeof provider.removeListener).toBe('function');
    });

    it('on() should return this for chaining', () => {
      const provider = new PartyLayerProvider();
      const result = provider.on('test', () => {});
      expect(result).toBe(provider);
    });

    it('removeListener() should return this for chaining', () => {
      const provider = new PartyLayerProvider();
      const handler = () => {};
      provider.on('test', handler);
      const result = provider.removeListener('test', handler);
      expect(result).toBe(provider);
    });

    it('emit() should return boolean', () => {
      const provider = new PartyLayerProvider();
      expect(provider.emit('test')).toBe(false);
      provider.on('test', () => {});
      expect(provider.emit('test')).toBe(true);
    });
  });

  describe('method routing', () => {
    it('should route requests to native wallet provider', async () => {
      const native = createMockNativeProvider({
        status: { connection: { isConnected: true } },
      });
      const provider = new PartyLayerProvider({
        walletProvider: createDiscovered(native),
      });

      const result = await provider.request({ method: 'status' });
      expect(result).toEqual({ connection: { isConnected: true } });
    });

    it('should throw DISCONNECTED without wallet provider', async () => {
      const provider = new PartyLayerProvider();

      try {
        await provider.request({ method: 'status' });
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ProviderRpcError);
        expect((err as ProviderRpcError).code).toBe(RPC_ERRORS.DISCONNECTED);
      }
    });

    it('should handle isConnected without wallet provider', async () => {
      const provider = new PartyLayerProvider();

      // isConnected uses an orchestrated handler that handles null wp
      // The default passthrough will fail, but our orchestration overrides it
      const result = await provider.request<{ isConnected: boolean }>({
        method: 'isConnected',
      });
      expect(result.isConnected).toBe(false);
    });
  });

  describe('connect orchestration', () => {
    it('should emit statusChanged on sync connect', async () => {
      const native = createMockNativeProvider({
        connect: { isConnected: true },
        status: {
          connection: { isConnected: true },
          provider: { id: 'test', version: '1.0', providerType: 'browser' },
        },
      });
      const provider = new PartyLayerProvider({
        walletProvider: createDiscovered(native),
      });

      const handler = vi.fn();
      provider.on(CIP0103_EVENTS.STATUS_CHANGED, handler);

      await provider.request({ method: 'connect' });

      // Wait for async emitStatusChanged
      await new Promise((r) => setTimeout(r, 50));
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('event forwarding', () => {
    it('should forward native wallet events', () => {
      const native = createMockNativeProvider();
      const provider = new PartyLayerProvider({
        walletProvider: createDiscovered(native),
      });

      const handler = vi.fn();
      provider.on(CIP0103_EVENTS.TX_CHANGED, handler);

      // Simulate native wallet emitting txChanged
      native.emit(CIP0103_EVENTS.TX_CHANGED, {
        status: 'executed',
        commandId: 'cmd-1',
      });

      expect(handler).toHaveBeenCalledWith({
        status: 'executed',
        commandId: 'cmd-1',
      });
    });

    it('should stop forwarding after destroy()', () => {
      const native = createMockNativeProvider();
      const provider = new PartyLayerProvider({
        walletProvider: createDiscovered(native),
      });

      const handler = vi.fn();
      provider.on(CIP0103_EVENTS.TX_CHANGED, handler);

      provider.destroy();

      native.emit(CIP0103_EVENTS.TX_CHANGED, { status: 'pending', commandId: 'cmd-2' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('wallet switching', () => {
    it('should allow switching wallet providers', async () => {
      const native1 = createMockNativeProvider({
        status: { connection: { isConnected: true }, provider: { id: 'wallet1' } },
      });
      const native2 = createMockNativeProvider({
        status: { connection: { isConnected: true }, provider: { id: 'wallet2' } },
      });

      const provider = new PartyLayerProvider({
        walletProvider: createDiscovered(native1),
      });

      const result1 = await provider.request({ method: 'status' });
      expect((result1 as { provider: { id: string } }).provider.id).toBe('wallet1');

      provider.setWalletProvider(createDiscovered(native2));

      const result2 = await provider.request({ method: 'status' });
      expect((result2 as { provider: { id: string } }).provider.id).toBe('wallet2');
    });
  });
});
