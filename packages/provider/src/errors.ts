/**
 * CIP-0103 / EIP-1193 / EIP-1474 Error Model
 *
 * All errors on the Provider surface MUST be ProviderRpcError instances
 * with numeric codes. No PartyLayer string-based ErrorCode is ever exposed.
 *
 * Reference: https://eips.ethereum.org/EIPS/eip-1193
 * Reference: https://eips.ethereum.org/EIPS/eip-1474
 */

// ─── ProviderRpcError ────────────────────────────────────────────────────────

export class ProviderRpcError extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(message: string, code: number, data?: unknown) {
    super(message);
    this.name = 'ProviderRpcError';
    this.code = code;
    this.data = data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProviderRpcError);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      data: this.data,
    };
  }
}

// ─── EIP-1193 Standard Error Codes ──────────────────────────────────────────

export const RPC_ERRORS = {
  /** User rejected the request */
  USER_REJECTED: 4001,
  /** The requested method/account is not authorized */
  UNAUTHORIZED: 4100,
  /** Provider does not support the requested method */
  UNSUPPORTED_METHOD: 4200,
  /** Provider is disconnected from all chains */
  DISCONNECTED: 4900,
  /** Provider is not connected to the requested chain */
  CHAIN_DISCONNECTED: 4901,
} as const;

// ─── EIP-1474 JSON-RPC Error Codes ─────────────────────────────────────────

export const JSON_RPC_ERRORS = {
  /** Invalid JSON (parse error) */
  PARSE_ERROR: -32700,
  /** Invalid request object */
  INVALID_REQUEST: -32600,
  /** Method not found */
  METHOD_NOT_FOUND: -32601,
  /** Invalid method parameters */
  INVALID_PARAMS: -32602,
  /** Internal JSON-RPC error */
  INTERNAL_ERROR: -32603,
  /** Invalid input / missing or invalid parameters */
  INVALID_INPUT: -32000,
  /** Resource not found */
  RESOURCE_NOT_FOUND: -32001,
  /** Resource unavailable */
  RESOURCE_UNAVAILABLE: -32002,
  /** Transaction rejected */
  TRANSACTION_REJECTED: -32003,
  /** Method not supported */
  METHOD_NOT_SUPPORTED: -32004,
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED: -32005,
} as const;

// ─── Convenience Constructors ───────────────────────────────────────────────

export function userRejected(
  message = 'User Rejected Request',
  data?: unknown,
): ProviderRpcError {
  return new ProviderRpcError(message, RPC_ERRORS.USER_REJECTED, data);
}

export function unauthorized(
  message = 'Unauthorized',
  data?: unknown,
): ProviderRpcError {
  return new ProviderRpcError(message, RPC_ERRORS.UNAUTHORIZED, data);
}

export function unsupportedMethod(method: string): ProviderRpcError {
  return new ProviderRpcError(
    `Unsupported Method: "${method}"`,
    RPC_ERRORS.UNSUPPORTED_METHOD,
    { method },
  );
}

export function disconnected(
  message = 'Disconnected',
): ProviderRpcError {
  return new ProviderRpcError(message, RPC_ERRORS.DISCONNECTED);
}

export function chainDisconnected(
  message = 'Chain Disconnected',
): ProviderRpcError {
  return new ProviderRpcError(message, RPC_ERRORS.CHAIN_DISCONNECTED);
}

export function internalError(
  message: string,
  data?: unknown,
): ProviderRpcError {
  return new ProviderRpcError(message, JSON_RPC_ERRORS.INTERNAL_ERROR, data);
}

export function invalidParams(
  message: string,
  data?: unknown,
): ProviderRpcError {
  return new ProviderRpcError(message, JSON_RPC_ERRORS.INVALID_PARAMS, data);
}

export function methodNotFound(method: string): ProviderRpcError {
  return new ProviderRpcError(
    `Method not found: "${method}"`,
    JSON_RPC_ERRORS.METHOD_NOT_FOUND,
    { method },
  );
}

export function resourceNotFound(
  message: string,
  data?: unknown,
): ProviderRpcError {
  return new ProviderRpcError(message, JSON_RPC_ERRORS.RESOURCE_NOT_FOUND, data);
}

export function resourceUnavailable(
  message: string,
  data?: unknown,
): ProviderRpcError {
  return new ProviderRpcError(message, JSON_RPC_ERRORS.RESOURCE_UNAVAILABLE, data);
}

export function transactionRejected(
  message = 'Transaction rejected',
  data?: unknown,
): ProviderRpcError {
  return new ProviderRpcError(message, JSON_RPC_ERRORS.TRANSACTION_REJECTED, data);
}
