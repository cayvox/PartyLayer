/**
 * Privacy validation utilities
 * 
 * Ensures incoming payloads don't contain PII.
 */

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

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate that a payload is privacy-safe
 */
export function validatePayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }
  
  const obj = payload as Record<string, unknown>;
  
  // Check for forbidden fields
  for (const field of FORBIDDEN_FIELDS) {
    if (field in obj) {
      return { valid: false, error: `Forbidden field: ${field}` };
    }
  }
  
  // Validate required fields
  if (typeof obj.sdkVersion !== 'string') {
    return { valid: false, error: 'Missing or invalid sdkVersion' };
  }
  
  if (typeof obj.network !== 'string') {
    return { valid: false, error: 'Missing or invalid network' };
  }
  
  if (typeof obj.timestamp !== 'number' || obj.timestamp <= 0) {
    return { valid: false, error: 'Missing or invalid timestamp' };
  }
  
  if (!obj.metrics || typeof obj.metrics !== 'object') {
    return { valid: false, error: 'Missing or invalid metrics' };
  }
  
  // Validate metrics are all numbers
  for (const [key, value] of Object.entries(obj.metrics as Record<string, unknown>)) {
    if (typeof key !== 'string' || typeof value !== 'number') {
      return { valid: false, error: `Invalid metric: ${key}` };
    }
  }
  
  // Validate optional hashed fields
  if (obj.appIdHash !== undefined && typeof obj.appIdHash !== 'string') {
    return { valid: false, error: 'Invalid appIdHash' };
  }
  
  if (obj.originHash !== undefined && typeof obj.originHash !== 'string') {
    return { valid: false, error: 'Invalid originHash' };
  }
  
  return { valid: true };
}
