import { describe, it, expect, vi } from 'vitest';
import { CIP0103EventBus } from '../event-bus';
import type { CIP0103Provider } from '@partylayer/core';

function createMockOwner(): CIP0103Provider {
  const owner = {} as CIP0103Provider;
  return owner;
}

describe('CIP0103EventBus', () => {
  it('should emit events to listeners', () => {
    const bus = new CIP0103EventBus();
    const owner = createMockOwner();
    bus.setOwner(owner);

    const handler = vi.fn();
    bus.on('test', handler);
    bus.emit('test', 'arg1', 'arg2');

    expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should return true from emit when listeners exist', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());
    bus.on('test', () => {});

    expect(bus.emit('test')).toBe(true);
  });

  it('should return false from emit when no listeners exist', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    expect(bus.emit('test')).toBe(false);
  });

  it('should return owner from on() for chaining', () => {
    const bus = new CIP0103EventBus();
    const owner = createMockOwner();
    bus.setOwner(owner);

    const result = bus.on('test', () => {});
    expect(result).toBe(owner);
  });

  it('should return owner from removeListener() for chaining', () => {
    const bus = new CIP0103EventBus();
    const owner = createMockOwner();
    bus.setOwner(owner);

    const handler = () => {};
    bus.on('test', handler);
    const result = bus.removeListener('test', handler);
    expect(result).toBe(owner);
  });

  it('should remove listener correctly', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    const handler = vi.fn();
    bus.on('test', handler);
    bus.removeListener('test', handler);
    bus.emit('test');

    expect(handler).not.toHaveBeenCalled();
  });

  it('should support multiple listeners per event', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('test', handler1);
    bus.on('test', handler2);
    bus.emit('test', 'data');

    expect(handler1).toHaveBeenCalledWith('data');
    expect(handler2).toHaveBeenCalledWith('data');
  });

  it('should not emit to listeners of other events', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    const handler = vi.fn();
    bus.on('other', handler);
    bus.emit('test');

    expect(handler).not.toHaveBeenCalled();
  });

  it('should swallow listener errors', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    const badHandler = () => {
      throw new Error('listener error');
    };
    const goodHandler = vi.fn();
    bus.on('test', badHandler);
    bus.on('test', goodHandler);

    // Should not throw
    expect(() => bus.emit('test')).not.toThrow();
    // Good handler should still be called
    expect(goodHandler).toHaveBeenCalled();
  });

  it('should removeAllListeners for a specific event', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('a', handler1);
    bus.on('b', handler2);

    bus.removeAllListeners('a');
    bus.emit('a');
    bus.emit('b');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('should removeAllListeners globally', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    const handler1 = vi.fn();
    const handler2 = vi.fn();
    bus.on('a', handler1);
    bus.on('b', handler2);

    bus.removeAllListeners();
    bus.emit('a');
    bus.emit('b');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should report correct listenerCount', () => {
    const bus = new CIP0103EventBus();
    bus.setOwner(createMockOwner());

    expect(bus.listenerCount('test')).toBe(0);
    bus.on('test', () => {});
    expect(bus.listenerCount('test')).toBe(1);
    bus.on('test', () => {});
    expect(bus.listenerCount('test')).toBe(2);
  });
});
