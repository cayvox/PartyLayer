# @partylayer/core

<div align="center">

**Core types, errors, and abstractions for PartyLayer**

[![npm version](https://img.shields.io/npm/v/@partylayer/core.svg?style=flat-square)](https://www.npmjs.com/package/@partylayer/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## Overview

`@partylayer/core` provides the foundational types, error classes, and abstractions used by the PartyLayer SDK ecosystem. This package is primarily intended for:

- **Wallet adapter developers** building custom adapters
- **SDK contributors** working on the core SDK
- **Advanced users** who need direct access to types and utilities

> **Note**: Most dApp developers should use `@partylayer/sdk` instead, which re-exports the necessary types from this package.

---

## Installation

```bash
npm install @partylayer/core
```

---

## What's Included

### Type Definitions

```typescript
import type {
  // Branded types
  WalletId,
  PartyId,
  SessionId,
  NetworkId,
  CapabilityKey,
  Signature,
  TransactionHash,

  // Core types
  WalletInfo,
  Session,
  SignedMessage,
  SignedTransaction,
  TxReceipt,
  TransactionStatus,

  // Adapter types
  WalletAdapter,
  AdapterContext,
  AdapterDetectResult,
  AdapterConnectResult,
  SignMessageParams,
  SignTransactionParams,
  SubmitTransactionParams,

  // Service adapters
  StorageAdapter,
  CryptoAdapter,
  LoggerAdapter,
  TelemetryAdapter,
} from '@partylayer/core';
```

### Error Classes

```typescript
import {
  PartyLayerError,
  WalletNotFoundError,
  WalletNotInstalledError,
  UserRejectedError,
  OriginNotAllowedError,
  SessionExpiredError,
  CapabilityNotSupportedError,
  TransportError,
  RegistryFetchFailedError,
  RegistryVerificationFailedError,
  RegistrySchemaInvalidError,
  InternalError,
  TimeoutError,
} from '@partylayer/core';
```

### Transport Classes

```typescript
import {
  PostMessageTransport,
  DeepLinkTransport,
  MockTransport,
} from '@partylayer/core';
```

### Utilities

```typescript
import {
  // Type constructors
  toWalletId,
  toPartyId,
  toSessionId,
  toNetworkId,
  toSignature,
  toTransactionHash,

  // Guards
  capabilityGuard,
  installGuard,

  // Error mapping
  mapUnknownErrorToPartyLayerError,
} from '@partylayer/core';
```

---

## Building a Wallet Adapter

If you're building a custom wallet adapter, implement the `WalletAdapter` interface:

```typescript
import type {
  WalletAdapter,
  AdapterContext,
  AdapterDetectResult,
  AdapterConnectResult,
  Session,
  SignedMessage,
  SignedTransaction,
  SignMessageParams,
  SignTransactionParams,
} from '@partylayer/core';
import { toWalletId, toSignature } from '@partylayer/core';

export class MyWalletAdapter implements WalletAdapter {
  readonly walletId = toWalletId('my-wallet');
  readonly name = 'My Wallet';

  getCapabilities() {
    return ['signMessage', 'signTransaction'] as const;
  }

  async detectInstalled(): Promise<AdapterDetectResult> {
    const installed = typeof window !== 'undefined' && 
                      window.myWallet !== undefined;
    return { installed };
  }

  async connect(
    ctx: AdapterContext,
    options: { timeoutMs: number }
  ): Promise<AdapterConnectResult> {
    // Implement connection logic
    const result = await window.myWallet.connect();
    
    return {
      partyId: toPartyId(result.partyId),
      capabilities: this.getCapabilities(),
      session: {
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      },
    };
  }

  async disconnect(ctx: AdapterContext, session: Session): Promise<void> {
    await window.myWallet.disconnect();
  }

  async signMessage(
    ctx: AdapterContext,
    session: Session,
    params: SignMessageParams
  ): Promise<SignedMessage> {
    const sig = await window.myWallet.signMessage(params.message);
    return {
      message: params.message,
      signature: toSignature(sig),
    };
  }

  // Implement other methods...
}
```

---

## Error Handling

All errors extend `PartyLayerError` and include an error code:

```typescript
import { 
  PartyLayerError, 
  WalletNotInstalledError 
} from '@partylayer/core';

try {
  // ... wallet operation
} catch (error) {
  if (error instanceof PartyLayerError) {
    console.log('Error code:', error.code);
    console.log('Message:', error.message);
    console.log('Cause:', error.cause);
  }
}
```

### Error Codes

| Error Class | Code |
|-------------|------|
| `WalletNotFoundError` | `WALLET_NOT_FOUND` |
| `WalletNotInstalledError` | `WALLET_NOT_INSTALLED` |
| `UserRejectedError` | `USER_REJECTED` |
| `OriginNotAllowedError` | `ORIGIN_NOT_ALLOWED` |
| `SessionExpiredError` | `SESSION_EXPIRED` |
| `CapabilityNotSupportedError` | `CAPABILITY_NOT_SUPPORTED` |
| `TransportError` | `TRANSPORT_ERROR` |
| `TimeoutError` | `TIMEOUT` |
| `InternalError` | `INTERNAL_ERROR` |

---

## Related Packages

| Package | Description |
|---------|-------------|
| [@partylayer/sdk](https://www.npmjs.com/package/@partylayer/sdk) | Main SDK for dApps |
| [@partylayer/react](https://www.npmjs.com/package/@partylayer/react) | React integration |
| [@partylayer/adapter-starter](https://www.npmjs.com/package/@partylayer/adapter-starter) | Template for new adapters |

---

## Links

- [GitHub Repository](https://github.com/PartyLayer/PartyLayer)
- [Wallet Provider Guide](https://github.com/PartyLayer/PartyLayer/blob/main/docs/wallet-provider-guide.md)
- [Report Issues](https://github.com/PartyLayer/PartyLayer/issues)

---

## License

MIT
