import { describe, it, expect } from 'vitest';
import { toCAIP2Network, fromCAIP2Network, isValidCAIP2, CANTON_NETWORKS } from '../network';

describe('toCAIP2Network', () => {
  it('should map well-known short names', () => {
    expect(toCAIP2Network('devnet')).toEqual({ networkId: 'canton:da-devnet' });
    expect(toCAIP2Network('testnet')).toEqual({ networkId: 'canton:da-testnet' });
    expect(toCAIP2Network('mainnet')).toEqual({ networkId: 'canton:da-mainnet' });
    expect(toCAIP2Network('local')).toEqual({ networkId: 'canton:da-local' });
  });

  it('should pass through CAIP-2 format', () => {
    expect(toCAIP2Network('canton:da-mainnet')).toEqual({
      networkId: 'canton:da-mainnet',
    });
  });

  it('should prefix unknown networks with canton:', () => {
    expect(toCAIP2Network('custom-net')).toEqual({
      networkId: 'canton:custom-net',
    });
  });

  it('should throw on invalid CAIP-2 result', () => {
    // Empty string produces 'canton:' which is invalid
    expect(() => toCAIP2Network('')).toThrow('Invalid CAIP-2');
  });

  it('should throw on invalid passthrough CAIP-2', () => {
    // 'a:b' has namespace too short (< 3 chars)
    expect(() => toCAIP2Network('a:b')).toThrow('Invalid CAIP-2');
  });
});

describe('fromCAIP2Network', () => {
  it('should reverse well-known CAIP-2 IDs', () => {
    expect(fromCAIP2Network('canton:da-devnet')).toBe('devnet');
    expect(fromCAIP2Network('canton:da-mainnet')).toBe('mainnet');
  });

  it('should extract reference for unknown CAIP-2', () => {
    expect(fromCAIP2Network('canton:custom')).toBe('custom');
  });

  it('should return original if no colon', () => {
    expect(fromCAIP2Network('devnet')).toBe('devnet');
  });
});

describe('isValidCAIP2', () => {
  it('should validate correct CAIP-2 format', () => {
    expect(isValidCAIP2('canton:da-mainnet')).toBe(true);
    expect(isValidCAIP2('canton:da-devnet')).toBe(true);
    expect(isValidCAIP2('eip155:1')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(isValidCAIP2('devnet')).toBe(false);
    expect(isValidCAIP2('')).toBe(false);
    expect(isValidCAIP2('a:b')).toBe(false); // namespace too short
    expect(isValidCAIP2('toolongnamespace:ref')).toBe(false);
  });
});

describe('CANTON_NETWORKS', () => {
  it('should contain all well-known networks', () => {
    expect(CANTON_NETWORKS.mainnet).toBe('canton:da-mainnet');
    expect(CANTON_NETWORKS.testnet).toBe('canton:da-testnet');
    expect(CANTON_NETWORKS.devnet).toBe('canton:da-devnet');
    expect(CANTON_NETWORKS.local).toBe('canton:da-local');
  });
});
