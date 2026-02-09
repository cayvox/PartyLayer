# PartyLayer Architecture

## Overview

PartyLayer provides a unified SDK for dApps to connect to multiple Canton Network wallets through a single integration. The architecture supports two integration paths:

1. **CIP-0103 Provider path** (recommended) — Uses `@partylayer/provider` to wrap native CIP-0103 wallet providers directly
2. **Adapter-based SDK path** (legacy) — Uses `@partylayer/sdk` with wallet adapters for wallet-specific integrations

The architecture is designed to be:

- **Modular**: Separate packages for core, SDK, provider, adapters, and React bindings
- **CIP-0103 compliant**: Native implementation of the Canton dApp Standard
- **Extensible**: Easy to add new wallet adapters or CIP-0103 wallet providers
- **Type-safe**: Full TypeScript support with strict mode
- **Future-proof**: Versioned registry with migration support

## Architecture Diagram

PartyLayer supports two integration paths. dApps can use either or both:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            dApp Application                                  │
│   ┌────────────────────────────────────────────────────────────────────┐     │
│   │              @partylayer/react (Hooks/UI)                         │     │
│   └────────────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────────────┘
           │                                          │
           ▼                                          ▼
┌──────────────────────────┐           ┌──────────────────────────────┐
│  CIP-0103 Provider Path  │           │   Adapter-based SDK Path     │
│  (recommended)           │           │   (legacy)                   │
│                          │           │                              │
│  @partylayer/provider    │           │  @partylayer/sdk             │
│  ┌────────────────────┐  │  bridge   │  ┌────────────────────────┐  │
│  │ PartyLayerProvider  │  │<─────────│  │ client.asProvider()    │  │
│  │ MethodRouter        │  │           │  │ Session Management     │  │
│  │ EventBus            │  │           │  │ Event System           │  │
│  │ Discovery           │  │           │  │ Storage                │  │
│  │ Error Model         │  │           │  └────────────────────────┘  │
│  └────────────────────┘  │           │             │                │
└──────────────────────────┘           └──────────────────────────────┘
           │                                          │
           ▼                                          ▼
┌──────────────────────────┐           ┌──────────────────────────────┐
│  Native CIP-0103 Wallets │           │  Wallet Adapters             │
│  (window.canton.*)       │           │  Console, Loop, Cantor8, Bron│
└──────────────────────────┘           └──────────────────────────────┘
                                                      │
                    ┌────────────────┐                 │
                    │ @partylayer    │                 │
                    │ /core          │<────────────────┘
                    │                │
                    │ Types          │
                    │ Errors         │
                    │ CIP-0103 Types │
                    │ Transport      │
                    └────────────────┘
```

## Package Structure

### `@partylayer/core`

Core types, errors, and abstractions used across all packages.

**Key Exports:**
- `types.ts`: Core TypeScript types (PartyId, Session, WalletMetadata, etc.)
- `errors.ts`: Error classes for different failure scenarios
- `adapter.ts`: WalletAdapter interface contract
- `transport.ts`: Transport abstractions for wallet communication
- `session.ts`: Session management utilities
- `cip0103-types.ts`: CIP-0103 type definitions (Provider, events, methods, accounts, networks)

### `@partylayer/registry-client`

Client for fetching and caching the wallet registry.

**Features:**
- Fetches registry from remote URL
- Validates registry schema
- Caches registry with TTL
- Converts registry entries to WalletMetadata

### `@partylayer/sdk`

Main SDK implementation that orchestrates wallet connections.

**Features:**
- Wallet adapter registration
- Session management with encrypted storage
- Event system for connect/disconnect/transaction updates
- Connection, signing, and transaction submission flows

### `@partylayer/provider`

CIP-0103 native Provider implementation.

**Key Exports:**
- `PartyLayerProvider`: CIP-0103-compliant Provider class wrapping native wallet providers
- `createProviderBridge()`: Backward-compatibility bridge from `PartyLayerClient` to CIP-0103 Provider
- `ProviderRpcError`: Error class with EIP-1193/EIP-1474 numeric codes
- `discoverInjectedProviders()`: Scans `window.canton.*` for injected CIP-0103 wallets
- `waitForProvider()`: Waits for a wallet provider to become available
- `MethodRouter`: Dispatches CIP-0103 method calls to handler functions
- `CIP0103EventBus`: Event emitter implementing CIP-0103 event semantics
- `toCAIP2Network()` / `fromCAIP2Network()`: CAIP-2 network identifier utilities

**Integration Paths:**
- **Native**: `new PartyLayerProvider({ wallet })` wraps any CIP-0103 wallet directly
- **Bridge**: `client.asProvider()` wraps the legacy `PartyLayerClient` as a CIP-0103 Provider

### `@partylayer/conformance-runner`

CLI and library for testing adapter and CIP-0103 conformance.

**Key Exports:**
- `runCIP0103ConformanceTests()`: Validates a Provider against CIP-0103 (interface, methods, events, errors)
- `formatCIP0103Report()`: Formats conformance results for terminal output

### `@partylayer/adapters/*`

Wallet-specific adapter implementations.

Each adapter implements the `WalletAdapter` interface:
- `connect()`: Establish connection to wallet
- `disconnect()`: Close connection
- `signMessage()`: Sign arbitrary messages
- `signTransaction()`: Sign DAML transactions
- `submitTransaction()`: Submit signed transactions
- `restoreSession()`: Restore existing session (if supported)

### `@partylayer/react`

React hooks and components for easy integration.

**Exports:**
- `PartyLayerProvider`: Context provider
- `usePartyLayer()`: Access SDK instance
- `useWallets()`: Get available wallets
- `useSessions()`: Get active sessions
- `useConnect()`: Connect hook
- `useDisconnect()`: Disconnect hook
- `useSignMessage()`: Sign message hook
- `WalletModal`: Wallet selection modal component

## Sequence Diagrams

### Connect Flow

```
dApp                    SDK                  Adapter              Wallet
 │                      │                     │                    │
 │  connect(walletId)   │                     │                    │
 ├─────────────────────>│                     │                    │
 │                      │  connect(options)   │                    │
 │                      ├─────────────────────>│                    │
 │                      │                     │  connect()         │
 │                      │                     ├───────────────────>│
 │                      │                     │  [User Approval]   │
 │                      │                     │<───────────────────│
 │                      │  {session, wallet}  │                    │
 │                      │<─────────────────────│                    │
 │  {session, wallet}   │                     │                    │
 │<─────────────────────│                     │                    │
 │                      │  storeSession()     │                    │
 │                      ├─────────────────────>│                    │
 │                      │  emit('connect')     │                    │
 │                      ├─────────────────────>│                    │
```

### Sign Transaction Flow

```
dApp                    SDK                  Adapter              Wallet
 │                      │                     │                    │
 │  signTransaction()   │                     │                    │
 ├─────────────────────>│                     │                    │
 │                      │  signTransaction()  │                    │
 │                      ├─────────────────────>│                    │
 │                      │                     │  signTransaction() │
 │                      │                     ├───────────────────>│
 │                      │                     │  [User Approval]   │
 │                      │                     │<───────────────────│
 │                      │  {signedTx, hash}   │                    │
 │                      │<─────────────────────│                    │
 │  {signedTx, hash}    │                     │                    │
 │<─────────────────────│                     │                    │
```

### Session Restore Flow

```
SDK                    Storage              Adapter
 │                      │                     │
 │  getAllSessions()    │                     │
 ├─────────────────────>│                     │
 │  [sessions]          │                     │
 │<─────────────────────│                     │
 │                      │                     │
 │  restoreSession()    │                     │
 ├───────────────────────────────────────────>│
 │                      │  validateSession()  │
 │                      │<────────────────────│
 │  true/false          │                     │
 │<───────────────────────────────────────────│
 │                      │                     │
 │  if (!restored)      │                     │
 │    removeSession()   │                     │
 ├─────────────────────>│                     │
```

## Security Considerations

### Origin Binding

Sessions are bound to the origin (domain) that created them. This prevents:
- Session hijacking across domains
- Cross-site request forgery (CSRF)

### Encrypted Storage

Session metadata is encrypted using Web Crypto API before storage:
- Uses AES-GCM encryption
- Key derived from origin (deterministic)
- Fallback to base64 encoding if Web Crypto unavailable

### Explicit Consent

All wallet operations require explicit user consent:
- Connection requests show app name and requested permissions
- Signing operations display the payload to be signed
- Transaction submissions show transaction details

### Safe Payload Display

The SDK provides utilities for safely displaying:
- Party IDs
- Transaction hashes
- Signing payloads (with truncation for long content)

## Registry Schema

The wallet registry is a versioned JSON document:

```json
{
  "metadata": {
    "version": "1.0.0",
    "schemaVersion": "1.0.0",
    "timestamp": 1234567890,
    "publisher": "PartyLayer",
    "previousVersion": "0.9.0"
  },
  "wallets": [
    {
      "id": "console",
      "name": "Console Wallet",
      "description": "Official Console Wallet",
      "homepage": "https://console.digitalasset.com",
      "icon": "https://...",
      "supportedNetworks": ["mainnet", "devnet", "local"],
      "capabilities": {
        "signMessage": true,
        "signTransaction": true,
        "submitTransaction": true,
        "transactionStatus": true,
        "switchNetwork": true,
        "multiParty": false
      },
      "adapter": {
        "type": "console",
        "config": {}
      },
      "installation": {
        "windowProperty": "consoleWallet"
      }
    }
  ],
  "signature": {
    "algorithm": "ed25519",
    "signature": "...",
    "publicKey": "..."
  }
}
```

## Error Handling

### SDK Error Classes (adapter-based path)

- `WalletNotFoundError`: Wallet not in registry
- `WalletNotInstalledError`: Wallet not installed in browser
- `ConnectionRejectedError`: User rejected connection
- `SessionExpiredError`: Session has expired
- `UserRejectedError`: User rejected signing operation
- `TransportError`: Communication error with wallet
- `TimeoutError`: Operation timed out

### CIP-0103 Provider Errors (Provider path)

The CIP-0103 Provider uses `ProviderRpcError` with standard numeric codes:

- **EIP-1193 codes** (4001–4901): User Rejected, Unauthorized, Unsupported Method, Disconnected, Chain Disconnected
- **EIP-1474 codes** (-32700 to -32005): Parse Error, Invalid Request, Method Not Found, Invalid Params, Internal Error, and more

All SDK error classes are bidirectionally mapped to `ProviderRpcError` codes via `toProviderRpcError()` and `toPartyLayerError()` in `@partylayer/provider`.

## Event System

### SDK Events (adapter-based path)

- `session:connected`: New wallet connection
- `session:disconnected`: Wallet disconnected
- `session:expired`: Session expired
- `tx:status`: Transaction status update
- `registry:status`: Registry status change
- `error`: Error occurred

### CIP-0103 Events (Provider path)

- `statusChanged`: Provider status changed (connection, network, session)
- `accountsChanged`: Account list changed
- `txChanged`: Transaction lifecycle update (pending → signed → executed / failed)
- `connected`: Wallet connected (used in async connect flows)

## Future Enhancements

- Multi-party support (multiple parties per session)
- Transaction batching
- Offline transaction preparation
- Enhanced telemetry (opt-in)
- Mobile wallet support via deep links
