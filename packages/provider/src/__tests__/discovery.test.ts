/**
 * Discovery mechanism tests
 *
 * Mocks the `window` global to simulate browser environments
 * where wallets inject CIP-0103 Providers.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { discoverInjectedProviders, isCIP0103Provider } from '../discovery';

// ─── Mock Provider Factory ───────────────────────────────────────────────────

function createMockProvider(id?: string) {
  return {
    request: async () => ({ id }),
    on: () => ({} as unknown),
    emit: () => true,
    removeListener: () => ({} as unknown),
  };
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────

let originalWindow: typeof globalThis.window;

beforeEach(() => {
  originalWindow = globalThis.window;
  // Create a minimal window mock
  (globalThis as Record<string, unknown>).window = {} as Window & typeof globalThis;
});

afterEach(() => {
  if (originalWindow === undefined) {
    delete (globalThis as Record<string, unknown>).window;
  } else {
    (globalThis as Record<string, unknown>).window = originalWindow;
  }
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('isCIP0103Provider', () => {
  it('returns true for valid provider shape', () => {
    expect(isCIP0103Provider(createMockProvider())).toBe(true);
  });

  it('returns false for null', () => {
    expect(isCIP0103Provider(null)).toBe(false);
  });

  it('returns false for object missing methods', () => {
    expect(isCIP0103Provider({ request: () => {} })).toBe(false);
    expect(isCIP0103Provider({ request: () => {}, on: () => {} })).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isCIP0103Provider('string')).toBe(false);
    expect(isCIP0103Provider(42)).toBe(false);
    expect(isCIP0103Provider(undefined)).toBe(false);
  });
});

describe('discoverInjectedProviders', () => {
  it('returns empty array when no providers injected', () => {
    const result = discoverInjectedProviders();
    expect(result).toEqual([]);
  });

  it('discovers provider at window.consoleWallet', () => {
    const provider = createMockProvider('console');
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.consoleWallet = provider;

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('consoleWallet');
    expect(result[0].provider).toBe(provider);
    expect(result[0].source).toBe('injected');
  });

  it('discovers provider at window.cantonWallet', () => {
    const provider = createMockProvider('cantonWallet');
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.cantonWallet = provider;

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('cantonWallet');
  });

  it('discovers provider at window.splice', () => {
    const provider = createMockProvider('splice');
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.splice = provider;

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('splice');
  });

  it('discovers namespaced providers under window.canton.*', () => {
    const consoleProvider = createMockProvider('console');
    const loopProvider = createMockProvider('loop');
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.canton = {
      console: consoleProvider,
      loop: loopProvider,
    };

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(2);

    const ids = result.map((r) => r.id).sort();
    expect(ids).toEqual(['canton.console', 'canton.loop']);

    const consoleResult = result.find((r) => r.id === 'canton.console');
    expect(consoleResult?.provider).toBe(consoleProvider);
  });

  it('discovers canton namespace + direct injection together', () => {
    const consoleNs = createMockProvider('console-ns');
    const consoleDirect = createMockProvider('console-direct');
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.canton = { console: consoleNs };
    win.consoleWallet = consoleDirect;

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(2);

    const ids = result.map((r) => r.id).sort();
    expect(ids).toEqual(['canton.console', 'consoleWallet']);
  });

  it('deduplicates same provider instance across paths', () => {
    const sharedProvider = createMockProvider('shared');
    const win = globalThis.window as unknown as Record<string, unknown>;
    // Same provider at two paths
    win.consoleWallet = sharedProvider;
    win.canton = { console: sharedProvider };

    const result = discoverInjectedProviders();
    // Should only appear once due to dedup
    expect(result).toHaveLength(1);
  });

  it('ignores non-provider objects in canton namespace', () => {
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.canton = {
      validWallet: createMockProvider('valid'),
      notAWallet: { foo: 'bar' },
      aString: 'hello',
      aNumber: 42,
      nullValue: null,
    };

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('canton.validWallet');
  });

  it('ignores undefined/null at known paths', () => {
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.canton = undefined;
    win.consoleWallet = null;

    const result = discoverInjectedProviders();
    expect(result).toEqual([]);
  });

  it('returns empty when window is undefined', () => {
    delete (globalThis as Record<string, unknown>).window;
    const result = discoverInjectedProviders();
    expect(result).toEqual([]);
  });

  // ─── Realistic multi-wallet scenario ─────────────────────────────────

  it('discovers full ecosystem: Console + Loop + Splice', () => {
    const consoleProvider = createMockProvider('console');
    const loopProvider = createMockProvider('loop');
    const spliceProvider = createMockProvider('splice');

    const win = globalThis.window as unknown as Record<string, unknown>;
    win.canton = {
      console: consoleProvider,
      loop: loopProvider,
    };
    win.splice = spliceProvider;

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(3);

    const ids = result.map((r) => r.id).sort();
    expect(ids).toEqual(['canton.console', 'canton.loop', 'splice']);
  });

  it('discovers wallet injected at window.canton as direct provider', () => {
    // Some wallets might inject directly at window.canton (not as namespace)
    const directProvider = createMockProvider('canton-direct');
    const win = globalThis.window as unknown as Record<string, unknown>;
    win.canton = directProvider;

    const result = discoverInjectedProviders();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('canton');
    expect(result[0].provider).toBe(directProvider);
  });
});
