import { describe, it, expect } from 'vitest';
import { PartyLayerError, UserRejectedError, TimeoutError } from '@partylayer/core';
import { toProviderRpcError, toPartyLayerError } from '../error-map';
import { ProviderRpcError, RPC_ERRORS, JSON_RPC_ERRORS } from '../errors';

describe('toProviderRpcError', () => {
  it('should pass through ProviderRpcError', () => {
    const original = new ProviderRpcError('test', 4001);
    const result = toProviderRpcError(original);
    expect(result).toBe(original);
  });

  it('should map UserRejectedError to 4001', () => {
    const err = new UserRejectedError('connect');
    const result = toProviderRpcError(err);
    expect(result.code).toBe(RPC_ERRORS.USER_REJECTED);
    expect(result).toBeInstanceOf(ProviderRpcError);
  });

  it('should map TimeoutError to -32000', () => {
    const err = new TimeoutError('connect', 30000);
    const result = toProviderRpcError(err);
    expect(result.code).toBe(JSON_RPC_ERRORS.INVALID_INPUT);
  });

  it('should map standard Error to -32603', () => {
    const err = new Error('something broke');
    const result = toProviderRpcError(err);
    expect(result.code).toBe(JSON_RPC_ERRORS.INTERNAL_ERROR);
    expect(result.message).toBe('something broke');
  });

  it('should map RPC-shaped objects', () => {
    const err = { message: 'denied', code: 4001, data: { reason: 'user' } };
    const result = toProviderRpcError(err);
    expect(result.code).toBe(4001);
    expect(result.data).toEqual({ reason: 'user' });
  });

  it('should map string errors', () => {
    const result = toProviderRpcError('unknown failure');
    expect(result.code).toBe(JSON_RPC_ERRORS.INTERNAL_ERROR);
    expect(result.message).toBe('unknown failure');
  });
});

describe('toPartyLayerError', () => {
  it('should map 4001 to USER_REJECTED', () => {
    const rpc = new ProviderRpcError('rejected', 4001);
    const result = toPartyLayerError(rpc);
    expect(result).toBeInstanceOf(PartyLayerError);
    expect(result.code).toBe('USER_REJECTED');
  });

  it('should map unknown codes to INTERNAL_ERROR', () => {
    const rpc = new ProviderRpcError('unknown', 9999);
    const result = toPartyLayerError(rpc);
    expect(result.code).toBe('INTERNAL_ERROR');
  });
});
