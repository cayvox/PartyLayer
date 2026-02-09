/**
 * CIP-0103 Wallet Discovery
 *
 * Discovers CIP-0103-compliant wallet Providers from the global scope.
 * Wallet-agnostic: no hardcoded wallet logic, only duck-type checking
 * for the Provider interface shape.
 */

import type { CIP0103Provider } from '@partylayer/core';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Metadata about a discovered CIP-0103 wallet provider */
export interface DiscoveredProvider {
  /** Identifier (e.g. "canton.console", "consoleWallet") */
  id: string;
  /** The native CIP-0103 Provider instance */
  provider: CIP0103Provider;
  /** How it was discovered */
  source: 'injected' | 'registry';
  /** Whether the provider supports async flows (userUrl) */
  isAsync?: boolean;
  /** Display name (if discoverable from status) */
  name?: string;
}

// ─── Well-known injection paths ─────────────────────────────────────────────

/**
 * Well-known window property paths where Canton wallet providers
 * may inject themselves.
 *
 * This list is intentionally kept small and generic. New wallets
 * that follow the `window.canton.<wallet>` convention are discovered
 * automatically via namespace scanning.
 */
const KNOWN_INJECTION_PATHS = [
  'canton',
  'cantonWallet',
  'consoleWallet',
  'splice',
] as const;

// ─── Duck-type check ────────────────────────────────────────────────────────

/**
 * Check if an object implements the CIP-0103 Provider interface.
 *
 * This is a structural (duck-type) check — it verifies the presence of
 * the four required methods without checking implementation correctness.
 */
export function isCIP0103Provider(obj: unknown): obj is CIP0103Provider {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.request === 'function' &&
    typeof p.on === 'function' &&
    typeof p.emit === 'function' &&
    typeof p.removeListener === 'function'
  );
}

// ─── Discovery ──────────────────────────────────────────────────────────────

/**
 * Discover all injected CIP-0103 providers from the global scope.
 *
 * Scans well-known window paths and their sub-properties for objects
 * that implement the Provider interface.
 */
export function discoverInjectedProviders(): DiscoveredProvider[] {
  if (typeof window === 'undefined') return [];

  const discovered: DiscoveredProvider[] = [];
  const seen = new Set<CIP0103Provider>();
  const win = window as unknown as Record<string, unknown>;

  for (const path of KNOWN_INJECTION_PATHS) {
    const candidate = win[path];
    if (candidate === undefined || candidate === null) continue;

    // Direct provider at top level (e.g., window.consoleWallet)
    if (isCIP0103Provider(candidate) && !seen.has(candidate)) {
      seen.add(candidate);
      discovered.push({
        id: path,
        provider: candidate,
        source: 'injected',
      });
      continue;
    }

    // Namespace object containing sub-providers
    // (e.g., window.canton.console, window.canton.loop)
    if (typeof candidate === 'object') {
      for (const [key, value] of Object.entries(
        candidate as Record<string, unknown>,
      )) {
        if (isCIP0103Provider(value) && !seen.has(value)) {
          seen.add(value);
          discovered.push({
            id: `${path}.${key}`,
            provider: value,
            source: 'injected',
          });
        }
      }
    }
  }

  return discovered;
}

/**
 * Wait for a specific provider to be injected (with timeout).
 *
 * Extensions may inject their provider after page load. This function
 * polls at 100ms intervals until the provider appears or the timeout
 * expires.
 *
 * @param id - Provider id to match (exact or suffix match)
 * @param timeoutMs - Maximum wait time (default 3000ms)
 */
export function waitForProvider(
  id: string,
  timeoutMs = 3000,
): Promise<DiscoveredProvider | null> {
  return new Promise((resolve) => {
    // Check immediately
    const match = findById(id);
    if (match) {
      resolve(match);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      const match = findById(id);
      if (match) {
        clearInterval(interval);
        resolve(match);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function findById(id: string): DiscoveredProvider | undefined {
  return discoverInjectedProviders().find(
    (p) => p.id === id || p.id.endsWith(`.${id}`),
  );
}
