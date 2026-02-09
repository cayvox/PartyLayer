import { describe, it, expect } from 'vitest';
import {
  ProviderRpcError,
  RPC_ERRORS,
  JSON_RPC_ERRORS,
  userRejected,
  unsupportedMethod,
  disconnected,
  internalError,
  invalidParams,
  methodNotFound,
} from '../errors';

describe('ProviderRpcError', () => {
  it('should create error with code and message', () => {
    const err = new ProviderRpcError('test error', 4001);
    expect(err.message).toBe('test error');
    expect(err.code).toBe(4001);
    expect(err.data).toBeUndefined();
    expect(err.name).toBe('ProviderRpcError');
    expect(err instanceof Error).toBe(true);
  });

  it('should include data when provided', () => {
    const err = new ProviderRpcError('test', 4001, { foo: 'bar' });
    expect(err.data).toEqual({ foo: 'bar' });
  });

  it('should serialize to JSON', () => {
    const err = new ProviderRpcError('test', 4001, { key: 'val' });
    const json = err.toJSON();
    expect(json).toEqual({
      name: 'ProviderRpcError',
      message: 'test',
      code: 4001,
      data: { key: 'val' },
    });
  });
});

describe('error code constants', () => {
  it('should define EIP-1193 codes', () => {
    expect(RPC_ERRORS.USER_REJECTED).toBe(4001);
    expect(RPC_ERRORS.UNAUTHORIZED).toBe(4100);
    expect(RPC_ERRORS.UNSUPPORTED_METHOD).toBe(4200);
    expect(RPC_ERRORS.DISCONNECTED).toBe(4900);
    expect(RPC_ERRORS.CHAIN_DISCONNECTED).toBe(4901);
  });

  it('should define EIP-1474 codes', () => {
    expect(JSON_RPC_ERRORS.PARSE_ERROR).toBe(-32700);
    expect(JSON_RPC_ERRORS.INVALID_REQUEST).toBe(-32600);
    expect(JSON_RPC_ERRORS.METHOD_NOT_FOUND).toBe(-32601);
    expect(JSON_RPC_ERRORS.INVALID_PARAMS).toBe(-32602);
    expect(JSON_RPC_ERRORS.INTERNAL_ERROR).toBe(-32603);
    expect(JSON_RPC_ERRORS.TRANSACTION_REJECTED).toBe(-32003);
  });
});

describe('convenience constructors', () => {
  it('userRejected', () => {
    const err = userRejected();
    expect(err.code).toBe(4001);
  });

  it('unsupportedMethod', () => {
    const err = unsupportedMethod('foo');
    expect(err.code).toBe(4200);
    expect(err.data).toEqual({ method: 'foo' });
  });

  it('disconnected', () => {
    const err = disconnected();
    expect(err.code).toBe(4900);
  });

  it('internalError', () => {
    const err = internalError('oops');
    expect(err.code).toBe(-32603);
  });

  it('invalidParams', () => {
    const err = invalidParams('bad param');
    expect(err.code).toBe(-32602);
  });

  it('methodNotFound', () => {
    const err = methodNotFound('bar');
    expect(err.code).toBe(-32601);
  });
});
