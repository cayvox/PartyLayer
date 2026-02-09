import { describe, it, expect, vi } from 'vitest';
import { MethodRouter } from '../method-router';
import { ProviderRpcError, RPC_ERRORS } from '../errors';
import type { CIP0103Provider } from '@partylayer/core';

function createMockWalletProvider(
  responses: Record<string, unknown> = {},
): CIP0103Provider {
  return {
    request: vi.fn(async ({ method }) => {
      if (method in responses) return responses[method];
      throw new ProviderRpcError(`Not implemented: ${method}`, RPC_ERRORS.UNSUPPORTED_METHOD);
    }),
    on: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnValue(false),
    removeListener: vi.fn().mockReturnThis(),
  };
}

describe('MethodRouter', () => {
  it('should route known methods to wallet provider', async () => {
    const router = new MethodRouter();
    const wp = createMockWalletProvider({
      status: { connection: { isConnected: true } },
    });
    router.setWalletProvider(wp);

    const result = await router.route({ method: 'status' });
    expect(result).toEqual({ connection: { isConnected: true } });
    expect(wp.request).toHaveBeenCalledWith({ method: 'status', params: undefined });
  });

  it('should pass params to wallet provider', async () => {
    const router = new MethodRouter();
    const wp = createMockWalletProvider({ signMessage: 'sig123' });
    router.setWalletProvider(wp);

    await router.route({ method: 'signMessage', params: { message: 'hello' } });
    expect(wp.request).toHaveBeenCalledWith({
      method: 'signMessage',
      params: { message: 'hello' },
    });
  });

  it('should forward unknown methods to wallet provider', async () => {
    const router = new MethodRouter();
    const wp = createMockWalletProvider({ futureMethod: 'ok' });
    router.setWalletProvider(wp);

    const result = await router.route({ method: 'futureMethod' });
    expect(result).toBe('ok');
  });

  it('should throw UNSUPPORTED_METHOD for unknown methods without wallet provider', async () => {
    const router = new MethodRouter();

    try {
      await router.route({ method: 'unknownMethod' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ProviderRpcError);
      expect((err as ProviderRpcError).code).toBe(RPC_ERRORS.UNSUPPORTED_METHOD);
    }
  });

  it('should throw DISCONNECTED for methods requiring wallet provider', async () => {
    const router = new MethodRouter();

    try {
      await router.route({ method: 'status' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ProviderRpcError);
      expect((err as ProviderRpcError).code).toBe(RPC_ERRORS.DISCONNECTED);
    }
  });

  it('should allow connect without wallet provider', async () => {
    const router = new MethodRouter();
    // connect handler will fail because wp is null, but it should not throw DISCONNECTED
    // Instead it will try to call the handler with null wp
    // We need to register a handler that handles null
    router.register('connect', async (_wp, _params) => {
      return { isConnected: false, reason: 'no provider' };
    });

    const result = await router.route({ method: 'connect' });
    expect(result).toEqual({ isConnected: false, reason: 'no provider' });
  });

  it('should allow custom handler overrides', async () => {
    const router = new MethodRouter();
    const wp = createMockWalletProvider();
    router.setWalletProvider(wp);

    router.register('status', async () => {
      return { custom: true };
    });

    const result = await router.route({ method: 'status' });
    expect(result).toEqual({ custom: true });
    // Original wp.request should NOT have been called for overridden method
    expect(wp.request).not.toHaveBeenCalled();
  });

  it('should wrap handler errors as ProviderRpcError', async () => {
    const router = new MethodRouter();
    const wp = createMockWalletProvider();
    router.setWalletProvider(wp);

    router.register('status', async () => {
      throw new Error('internal failure');
    });

    try {
      await router.route({ method: 'status' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ProviderRpcError);
    }
  });

  it('should register all 10 CIP-0103 methods by default', () => {
    const router = new MethodRouter();
    const methods = [
      'connect', 'disconnect', 'isConnected', 'status',
      'getActiveNetwork', 'listAccounts', 'getPrimaryAccount',
      'signMessage', 'prepareExecute', 'ledgerApi',
    ];
    for (const m of methods) {
      expect(router.hasHandler(m)).toBe(true);
    }
  });
});
