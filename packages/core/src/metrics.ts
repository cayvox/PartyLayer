/**
 * Canonical Metrics Constants
 * 
 * These metric names are the official set for PartyLayer telemetry.
 * Changing these names would break metrics aggregation and downstream reporting.
 * 
 * @since 0.3.0
 */

/**
 * Enablement Metrics
 * 
 * These metrics measure how PartyLayer enables wallet interactions.
 */
export const ENABLEMENT_METRICS = {
  /** Total wallet connect() calls made */
  WALLET_CONNECT_ATTEMPTS: 'wallet_connect_attempts',
  
  /** Successful wallet connections (session:connected events) */
  WALLET_CONNECT_SUCCESS: 'wallet_connect_success',
  
  /** New sessions created (not restored) */
  SESSIONS_CREATED: 'sessions_created',
  
  /** Sessions successfully restored from storage */
  SESSIONS_RESTORED: 'sessions_restored',
  
  /** Total session restore attempts */
  RESTORE_ATTEMPTS: 'restore_attempts',
} as const;

/**
 * Error Metrics
 * 
 * These metrics track error occurrences by code.
 */
export const ERROR_METRICS = {
  /** Prefix for error metrics (e.g., error_USER_REJECTED) */
  ERROR_PREFIX: 'error_',
} as const;

/**
 * Registry Metrics
 * 
 * These metrics track registry client behavior.
 */
export const REGISTRY_METRICS = {
  /** Registry fetched from network */
  REGISTRY_FETCH: 'registry_fetch',
  
  /** Registry served from cache */
  REGISTRY_CACHE_HIT: 'registry_cache_hit',
  
  /** Stale registry was used */
  REGISTRY_STALE: 'registry_stale',
} as const;

/**
 * All metrics combined
 */
export const METRICS = {
  ...ENABLEMENT_METRICS,
  ...ERROR_METRICS,
  ...REGISTRY_METRICS,
} as const;

/**
 * Type for all metric names
 */
export type MetricName = typeof METRICS[keyof typeof METRICS];

/**
 * Build an error metric name from an error code
 * 
 * @param errorCode - The error code (e.g., 'USER_REJECTED')
 * @returns The metric name (e.g., 'error_USER_REJECTED')
 */
export function errorMetricName(errorCode: string): string {
  return `${METRICS.ERROR_PREFIX}${errorCode}`;
}
