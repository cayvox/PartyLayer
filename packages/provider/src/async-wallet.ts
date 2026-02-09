/**
 * Async Wallet Handling
 *
 * CIP-0103 async wallet extensions allow methods like `connect` and
 * `prepareExecute` to return a `{ userUrl }` instead of completing
 * synchronously. The user must visit the URL (e.g., mobile wallet
 * approval screen), and the wallet provider emits an event when the
 * operation completes.
 *
 * This module provides helpers that abstract the wait-for-event pattern
 * so the Provider implementation can offer a unified surface to dApps.
 */

import type {
  CIP0103Provider,
  CIP0103ConnectResult,
  CIP0103TxChangedEvent,
  CIP0103TxStatus,
} from '@partylayer/core';
import { CIP0103_EVENTS } from '@partylayer/core';
import { ProviderRpcError, JSON_RPC_ERRORS } from './errors';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AsyncConnectOptions {
  /** Timeout for waiting for the async connect event (ms) */
  timeoutMs?: number;
  /** Callback when userUrl is available (for UI to redirect / show QR) */
  onUserUrl?: (url: string) => void;
}

export interface AsyncPrepareExecuteOptions {
  timeoutMs?: number;
  onUserUrl?: (url: string) => void;
}

// ─── Async Connect ──────────────────────────────────────────────────────────

/**
 * Handle an async connect flow:
 *
 * 1. If connectResult is already isConnected (sync wallet), return immediately.
 * 2. If connectResult has userUrl, invoke onUserUrl callback for UI.
 * 3. Wait for 'connected' event from the wallet provider.
 * 4. Return the final ConnectResult.
 */
export async function handleAsyncConnect(
  walletProvider: CIP0103Provider,
  connectResult: CIP0103ConnectResult,
  options: AsyncConnectOptions = {},
): Promise<CIP0103ConnectResult> {
  // Sync wallet — already connected
  if (connectResult.isConnected && !connectResult.userUrl) {
    return connectResult;
  }

  // Notify UI of the userUrl
  if (connectResult.userUrl) {
    options.onUserUrl?.(connectResult.userUrl);
  }

  const timeoutMs = options.timeoutMs ?? 300_000; // 5-minute default

  return new Promise<CIP0103ConnectResult>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        walletProvider.removeListener(CIP0103_EVENTS.CONNECTED, onConnected);
        reject(
          new ProviderRpcError(
            'Async connect timed out',
            JSON_RPC_ERRORS.INVALID_INPUT,
            { timeoutMs },
          ),
        );
      }
    }, timeoutMs);

    const onConnected = (result: CIP0103ConnectResult) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        walletProvider.removeListener(CIP0103_EVENTS.CONNECTED, onConnected);
        resolve(result);
      }
    };

    walletProvider.on(CIP0103_EVENTS.CONNECTED, onConnected);
  });
}

// ─── Async PrepareExecute ───────────────────────────────────────────────────

const TERMINAL_TX_STATUSES: CIP0103TxStatus[] = ['executed', 'failed'];

/**
 * Handle an async prepareExecute flow:
 *
 * 1. If result has userUrl, invoke onUserUrl callback for UI.
 * 2. Wait for 'txChanged' event with matching commandId.
 * 3. Return when txChanged reaches a terminal state (executed / failed).
 */
export async function handleAsyncPrepareExecute(
  walletProvider: CIP0103Provider,
  commandId: string,
  userUrl: string | undefined,
  options: AsyncPrepareExecuteOptions = {},
): Promise<CIP0103TxChangedEvent> {
  if (userUrl) {
    options.onUserUrl?.(userUrl);
  }

  const timeoutMs = options.timeoutMs ?? 300_000;

  return new Promise<CIP0103TxChangedEvent>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        walletProvider.removeListener(CIP0103_EVENTS.TX_CHANGED, onTxChanged);
        reject(
          new ProviderRpcError(
            'Async prepareExecute timed out',
            JSON_RPC_ERRORS.INVALID_INPUT,
            { commandId, timeoutMs },
          ),
        );
      }
    }, timeoutMs);

    const onTxChanged = (event: CIP0103TxChangedEvent) => {
      // Ignore events for other commands
      if (event.commandId !== commandId) return;

      if (TERMINAL_TX_STATUSES.includes(event.status)) {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          walletProvider.removeListener(
            CIP0103_EVENTS.TX_CHANGED,
            onTxChanged,
          );

          if (event.status === 'failed') {
            reject(
              new ProviderRpcError(
                'Transaction failed',
                JSON_RPC_ERRORS.TRANSACTION_REJECTED,
                { commandId },
              ),
            );
          } else {
            resolve(event);
          }
        }
      }
    };

    walletProvider.on(CIP0103_EVENTS.TX_CHANGED, onTxChanged);
  });
}
