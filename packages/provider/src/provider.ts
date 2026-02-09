/**
 * PartyLayerProvider — CIP-0103 Native Provider Implementation
 *
 * This is the core Provider class. It wraps a single native CIP-0103
 * wallet provider and adds:
 *
 * - Method routing with orchestrated overrides (connect, disconnect, etc.)
 * - Event forwarding from the native wallet to the dApp
 * - Async wallet support (userUrl flows)
 * - Error normalization to ProviderRpcError
 * - Forward compatibility for unknown methods and events
 *
 * IMPORTANT: No wallet-specific logic lives here. The Provider is purely
 * a router and normalizer.
 */

import type {
  CIP0103Provider,
  CIP0103RequestPayload,
  CIP0103EventListener,
  CIP0103ConnectResult,
  CIP0103StatusEvent,
} from '@partylayer/core';
import { CIP0103_EVENTS } from '@partylayer/core';
import { CIP0103EventBus } from './event-bus';
import { MethodRouter } from './method-router';
import { handleAsyncConnect } from './async-wallet';
import type { DiscoveredProvider } from './discovery';

// ─── Configuration ──────────────────────────────────────────────────────────

export interface PartyLayerProviderOptions {
  /** Discovered wallet provider to wrap */
  walletProvider?: DiscoveredProvider;
  /** Timeout for async operations (ms). Default 300_000 (5 min). */
  asyncTimeoutMs?: number;
  /** Callback when a userUrl is available (for async wallets) */
  onUserUrl?: (url: string) => void;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export class PartyLayerProvider implements CIP0103Provider {
  private readonly eventBus: CIP0103EventBus;
  private readonly router: MethodRouter;
  private readonly options: PartyLayerProviderOptions;
  private nativeProvider: CIP0103Provider | null;
  private connected = false;

  /** Event forwarders from the native provider, keyed by event name */
  private nativeForwarders = new Map<string, CIP0103EventListener>();

  constructor(options: PartyLayerProviderOptions = {}) {
    this.options = options;
    this.eventBus = new CIP0103EventBus();
    this.eventBus.setOwner(this);
    this.router = new MethodRouter();

    this.nativeProvider = options.walletProvider?.provider ?? null;

    if (this.nativeProvider) {
      this.router.setWalletProvider(this.nativeProvider);
      this.forwardNativeEvents();
    }

    // Override default passthrough handlers with orchestrated versions
    this.registerOrchestratedMethods();
  }

  // ─── CIP-0103 Provider Interface ─────────────────────────────────────────

  async request<T = unknown>(args: CIP0103RequestPayload): Promise<T> {
    return this.router.route<T>(args);
  }

  on<T = unknown>(
    event: string,
    listener: CIP0103EventListener<T>,
  ): this {
    this.eventBus.on(event, listener);
    return this;
  }

  emit<T = unknown>(event: string, ...args: T[]): boolean {
    return this.eventBus.emit(event, ...args);
  }

  removeListener<T = unknown>(
    event: string,
    listenerToRemove: CIP0103EventListener<T>,
  ): this {
    this.eventBus.removeListener(event, listenerToRemove);
    return this;
  }

  // ─── Public Management ────────────────────────────────────────────────────

  /** Whether the provider is currently in a connected state */
  get isConnected(): boolean {
    return this.connected;
  }

  /** Switch the underlying wallet provider (e.g. user selects a different wallet) */
  setWalletProvider(discovered: DiscoveredProvider): void {
    this.unforwardNativeEvents();

    this.nativeProvider = discovered.provider;
    this.router.setWalletProvider(this.nativeProvider);
    this.forwardNativeEvents();
  }

  /** Get the currently attached native provider (if any) */
  getNativeProvider(): CIP0103Provider | null {
    return this.nativeProvider;
  }

  /** Tear down: unsubscribe all events and release the native provider */
  destroy(): void {
    this.unforwardNativeEvents();
    this.eventBus.removeAllListeners();
    this.nativeProvider = null;
    this.router.setWalletProvider(null);
    this.connected = false;
  }

  // ─── Orchestrated Method Overrides ────────────────────────────────────────

  private registerOrchestratedMethods(): void {
    // connect: handle async wallets, emit statusChanged
    this.router.register<CIP0103ConnectResult>(
      'connect',
      async (wp, params) => {
        const result = await wp.request<CIP0103ConnectResult>({
          method: 'connect',
          params,
        });

        // Handle async wallet flow (userUrl returned, not yet connected)
        if (result.userUrl && !result.isConnected) {
          const final = await handleAsyncConnect(wp, result, {
            timeoutMs: this.options.asyncTimeoutMs,
            onUserUrl: this.options.onUserUrl,
          });
          this.connected = final.isConnected;
          this.emitStatusChanged();
          return final;
        }

        this.connected = result.isConnected;
        this.emitStatusChanged();
        return result;
      },
    );

    // disconnect: update state, emit statusChanged
    this.router.register<void>('disconnect', async (wp, params) => {
      await wp.request<void>({ method: 'disconnect', params });
      this.connected = false;
      this.emitStatusChanged();
    });

    // isConnected: can work without a wallet provider
    this.router.register<CIP0103ConnectResult>(
      'isConnected',
      async (wp, params) => {
        if (!wp) {
          return {
            isConnected: false,
            reason: 'No wallet provider connected',
          };
        }
        return wp.request<CIP0103ConnectResult>({
          method: 'isConnected',
          params,
        });
      },
    );

    // prepareExecute: the wallet provider MUST emit txChanged per spec.
    // We forward those events through our event bus (via forwardNativeEvents).
    // This handler just passes through to the wallet.
    this.router.register('prepareExecute', async (wp, params) => {
      return wp.request({ method: 'prepareExecute', params });
    });
  }

  // ─── Native Event Forwarding ──────────────────────────────────────────────

  private forwardNativeEvents(): void {
    if (!this.nativeProvider) return;

    const eventsToForward = [
      CIP0103_EVENTS.STATUS_CHANGED,
      CIP0103_EVENTS.ACCOUNTS_CHANGED,
      CIP0103_EVENTS.TX_CHANGED,
      CIP0103_EVENTS.CONNECTED,
    ];

    for (const event of eventsToForward) {
      const forwarder: CIP0103EventListener = (...args: unknown[]) => {
        this.eventBus.emit(event, ...args);
      };
      this.nativeForwarders.set(event, forwarder);
      this.nativeProvider.on(event, forwarder);
    }
  }

  private unforwardNativeEvents(): void {
    if (!this.nativeProvider) return;
    for (const [event, forwarder] of this.nativeForwarders) {
      this.nativeProvider.removeListener(event, forwarder);
    }
    this.nativeForwarders.clear();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Emit statusChanged by querying the current wallet provider status */
  private async emitStatusChanged(): Promise<void> {
    if (!this.nativeProvider) return;
    try {
      const status = await this.nativeProvider.request<CIP0103StatusEvent>({
        method: 'status',
      });
      this.eventBus.emit(CIP0103_EVENTS.STATUS_CHANGED, status);
    } catch {
      // Best-effort: status emission should not break the connect flow
    }
  }
}
