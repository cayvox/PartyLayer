/**
 * CIP-0103 Event Bus
 *
 * Minimal, spec-compliant event emitter.
 * - on() and removeListener() return the Provider (for chaining)
 * - emit() returns boolean (true if any listener was called)
 * - Listener errors are swallowed to prevent one handler from
 *   breaking others
 */

import type { CIP0103Provider, CIP0103EventListener } from '@partylayer/core';

export class CIP0103EventBus {
  private listeners = new Map<string, Set<CIP0103EventListener>>();
  private owner: CIP0103Provider | null = null;

  /** Set the owning Provider instance (for chaining returns) */
  setOwner(owner: CIP0103Provider): void {
    this.owner = owner;
  }

  on<T = unknown>(
    event: string,
    listener: CIP0103EventListener<T>,
  ): CIP0103Provider {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as CIP0103EventListener);
    return this.owner!;
  }

  emit<T = unknown>(event: string, ...args: T[]): boolean {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return false;

    for (const fn of set) {
      try {
        (fn as CIP0103EventListener<T>)(...args);
      } catch {
        // Swallow listener errors per spec behavior
      }
    }
    return true;
  }

  removeListener<T = unknown>(
    event: string,
    listenerToRemove: CIP0103EventListener<T>,
  ): CIP0103Provider {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listenerToRemove as CIP0103EventListener);
      if (set.size === 0) this.listeners.delete(event);
    }
    return this.owner!;
  }

  /** Remove all listeners, optionally scoped to a single event */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /** Number of listeners for a given event */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
