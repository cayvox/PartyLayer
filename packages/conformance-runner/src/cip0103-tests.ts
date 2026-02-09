/**
 * CIP-0103 Conformance Test Suite
 *
 * Validates that a Provider implementation conforms to CIP-0103:
 * - Interface shape (request, on, emit, removeListener)
 * - All 10 mandatory methods are handled
 * - Event subscription returns Provider for chaining
 * - Error responses use ProviderRpcError with numeric codes
 *
 * This suite can be run against:
 * - PartyLayerProvider (native path)
 * - createProviderBridge() (bridge path)
 * - Any third-party CIP-0103 Provider
 */

import type { CIP0103Provider } from '@partylayer/core';
import { CIP0103_MANDATORY_METHODS } from '@partylayer/core';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CIP0103TestResult {
  name: string;
  category: 'interface' | 'method' | 'event' | 'error';
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export interface CIP0103ConformanceReport {
  total: number;
  passed: number;
  failed: number;
  results: CIP0103TestResult[];
}

// ─── Runner ─────────────────────────────────────────────────────────────────

export async function runCIP0103ConformanceTests(
  provider: CIP0103Provider,
): Promise<CIP0103ConformanceReport> {
  const results: CIP0103TestResult[] = [];

  // ── Interface shape tests ─────────────────────────────────────────────

  results.push({
    name: 'Provider has request() method',
    category: 'interface',
    passed: typeof provider.request === 'function',
  });

  results.push({
    name: 'Provider has on() method',
    category: 'interface',
    passed: typeof provider.on === 'function',
  });

  results.push({
    name: 'Provider has emit() method',
    category: 'interface',
    passed: typeof provider.emit === 'function',
  });

  results.push({
    name: 'Provider has removeListener() method',
    category: 'interface',
    passed: typeof provider.removeListener === 'function',
  });

  // ── Method presence tests ─────────────────────────────────────────────

  for (const method of CIP0103_MANDATORY_METHODS) {
    try {
      await provider.request({ method, params: {} });
      results.push({
        name: `Method "${method}" is handled`,
        category: 'method',
        passed: true,
      });
    } catch (err: unknown) {
      // A valid ProviderRpcError means the method IS handled
      // (it just may not be authorized / connected yet)
      const isValidError = isNumericCodeError(err);
      results.push({
        name: `Method "${method}" is handled`,
        category: 'method',
        passed: isValidError,
        error: isValidError
          ? undefined
          : `Expected ProviderRpcError with numeric code, got: ${String(err)}`,
        details: isValidError
          ? { code: (err as { code: number }).code }
          : undefined,
      });
    }
  }

  // ── Event chaining tests ──────────────────────────────────────────────

  const noopHandler = () => {};

  const onResult = provider.on('statusChanged', noopHandler);
  results.push({
    name: 'on() returns Provider for chaining',
    category: 'event',
    passed: onResult === provider,
    error:
      onResult === provider
        ? undefined
        : 'on() did not return the Provider instance',
  });

  const removeResult = provider.removeListener('statusChanged', noopHandler);
  results.push({
    name: 'removeListener() returns Provider for chaining',
    category: 'event',
    passed: removeResult === provider,
    error:
      removeResult === provider
        ? undefined
        : 'removeListener() did not return the Provider instance',
  });

  // ── Error code validation ─────────────────────────────────────────────

  try {
    await provider.request({ method: '__cip0103_conformance_nonexistent__' });
    results.push({
      name: 'Unsupported method returns ProviderRpcError',
      category: 'error',
      passed: false,
      error: 'Expected error for unsupported method, got success',
    });
  } catch (err: unknown) {
    const hasNumericCode = isNumericCodeError(err);
    results.push({
      name: 'Unsupported method returns error with numeric code',
      category: 'error',
      passed: hasNumericCode,
      error: hasNumericCode
        ? undefined
        : `Expected numeric code, got: ${String(err)}`,
      details: hasNumericCode
        ? { code: (err as { code: number }).code }
        : undefined,
    });

    if (hasNumericCode) {
      const code = (err as { code: number }).code;
      // Should be 4200 (UNSUPPORTED_METHOD) or -32601 (METHOD_NOT_FOUND)
      const isCorrectCode = code === 4200 || code === -32601;
      results.push({
        name: 'Unsupported method uses code 4200 or -32601',
        category: 'error',
        passed: isCorrectCode,
        error: isCorrectCode
          ? undefined
          : `Expected code 4200 or -32601, got ${code}`,
        details: { code },
      });
    }
  }

  // ── emit() returns boolean ────────────────────────────────────────────

  const emitResult = provider.emit('__cip0103_conformance_test__');
  results.push({
    name: 'emit() returns boolean',
    category: 'interface',
    passed: typeof emitResult === 'boolean',
    error:
      typeof emitResult === 'boolean'
        ? undefined
        : `emit() returned ${typeof emitResult}`,
  });

  // ── Summary ───────────────────────────────────────────────────────────

  const passed = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isNumericCodeError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  return typeof (err as Record<string, unknown>).code === 'number';
}

// ─── Formatting ─────────────────────────────────────────────────────────────

export function formatCIP0103Report(report: CIP0103ConformanceReport): string {
  const lines: string[] = [
    '═══ CIP-0103 Conformance Report ═══',
    '',
    `Total: ${report.total}  Passed: ${report.passed}  Failed: ${report.failed}`,
    '',
  ];

  const categories = ['interface', 'method', 'event', 'error'] as const;
  for (const cat of categories) {
    const catResults = report.results.filter((r) => r.category === cat);
    if (catResults.length === 0) continue;
    lines.push(`── ${cat.toUpperCase()} ──`);
    for (const r of catResults) {
      const icon = r.passed ? '✓' : '✗';
      lines.push(`  ${icon} ${r.name}`);
      if (r.error) {
        lines.push(`    → ${r.error}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}
