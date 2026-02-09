/**
 * Metrics Payload Types and Privacy Validation
 * 
 * This module defines the privacy-safe payload format for metrics collection.
 * 
 * Privacy Guarantees:
 * - NO wallet addresses
 * - NO raw party IDs
 * - NO transaction payloads
 * - NO signed message content
 * - NO user identifiers
 * 
 * @since 0.3.0
 */

/**
 * Privacy-safe metrics payload
 * 
 * This is the only payload format accepted by the metrics backend.
 */
export interface MetricsPayload {
  /** SDK version (e.g., '0.3.0') */
  sdkVersion: string;
  
  /** Network identifier (e.g., 'devnet', 'mainnet') */
  network: string;
  
  /** Unix timestamp in milliseconds */
  timestamp: number;
  
  /** Metric name → value map */
  metrics: Record<string, number>;
  
  /** Hashed app identifier (opt-in, SHA-256) */
  appIdHash?: string;
  
  /** Hashed origin (opt-in, SHA-256) */
  originHash?: string;
}

/**
 * Fields that are NEVER allowed in metrics payloads
 */
const FORBIDDEN_FIELDS = [
  'walletAddress',
  'address',
  'partyId',
  'rawPartyId',
  'publicKey',
  'privateKey',
  'seed',
  'mnemonic',
  'txPayload',
  'transaction',
  'signedMessage',
  'message',
  'signature',
  'userId',
  'email',
  'name',
  'ip',
  'userAgent',
] as const;

/**
 * Validate that a payload is privacy-safe
 * 
 * @param payload - Unknown payload to validate
 * @returns true if payload is valid MetricsPayload with no PII
 * @throws Error if forbidden fields are detected
 */
export function validatePayload(payload: unknown): payload is MetricsPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  
  const obj = payload as Record<string, unknown>;
  
  // Check for forbidden fields
  for (const field of FORBIDDEN_FIELDS) {
    if (field in obj) {
      throw new Error(`Forbidden field detected in metrics payload: ${field}`);
    }
  }
  
  // Validate required fields
  if (typeof obj.sdkVersion !== 'string') {
    return false;
  }
  
  if (typeof obj.network !== 'string') {
    return false;
  }
  
  if (typeof obj.timestamp !== 'number' || obj.timestamp <= 0) {
    return false;
  }
  
  if (!obj.metrics || typeof obj.metrics !== 'object') {
    return false;
  }
  
  // Validate metrics are all numbers
  for (const [key, value] of Object.entries(obj.metrics as Record<string, unknown>)) {
    if (typeof key !== 'string' || typeof value !== 'number') {
      return false;
    }
  }
  
  // Validate optional hashed fields
  if (obj.appIdHash !== undefined && typeof obj.appIdHash !== 'string') {
    return false;
  }
  
  if (obj.originHash !== undefined && typeof obj.originHash !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Hash a string using SHA-256 (browser-compatible)
 * 
 * @param value - String to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashForPrivacy(value: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback: simple hash for non-browser environments
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a sanitized metrics payload
 * 
 * This function ensures the payload is privacy-safe before sending.
 * 
 * @param data - Raw metrics data
 * @returns Sanitized MetricsPayload
 */
export function createMetricsPayload(data: {
  sdkVersion: string;
  network: string;
  metrics: Record<string, number>;
  appIdHash?: string;
  originHash?: string;
}): MetricsPayload {
  const payload: MetricsPayload = {
    sdkVersion: data.sdkVersion,
    network: data.network,
    timestamp: Date.now(),
    metrics: { ...data.metrics },
  };
  
  if (data.appIdHash) {
    payload.appIdHash = data.appIdHash;
  }
  
  if (data.originHash) {
    payload.originHash = data.originHash;
  }
  
  // Final validation
  if (!validatePayload(payload)) {
    throw new Error('Failed to create valid metrics payload');
  }
  
  return payload;
}
