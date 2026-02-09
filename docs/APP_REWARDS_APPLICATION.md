# PartyLayer App Rewards Application

> **Template for Canton Foundation App Rewards submission**

---

## Executive Summary

**PartyLayer** is an infrastructure SDK that enables decentralized applications (dApps) on the Canton Network to connect with multiple wallet providers through a unified interface.

### Category: Infrastructure / Enablement Layer

PartyLayer does not produce transactions directly. Instead, it **enables** transactions by:
- Providing wallet connectivity to dApps
- Managing secure sessions
- Facilitating message and transaction signing
- Abstracting wallet-specific implementations

---

## Product Overview

### What is PartyLayer?

PartyLayer is the "WalletConnect for Canton Network" - a single SDK that allows dApps to integrate with all Canton wallets.

### Supported Wallets

| Wallet | Type | Status |
|--------|------|--------|
| Console Wallet | Browser Extension | Production |
| 5N Loop | Mobile / Web | Production |
| Cantor8 | Mobile | Production |
| Bron | Enterprise | Production |

### Technical Highlights

- **Open Source**: MIT licensed, community-driven
- **Type-Safe**: Full TypeScript support
- **Framework Support**: React hooks, Next.js compatible
- **Security**: Origin binding, encrypted storage, signature verification

---

## Metrics Report

> Replace values below with actual metrics from your dashboard

### Reporting Period
- **Start Date:** YYYY-MM-DD
- **End Date:** YYYY-MM-DD
- **Duration:** X months

### Adoption Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| Monthly Active dApps (MAD) | XX | Unique dApps using PartyLayer |
| Total dApps Integrated | XX | Cumulative integrations |
| Wallet Coverage | 4/4 | All major Canton wallets supported |

### Enablement Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| Wallet Connect Attempts | XX,XXX | Total connection attempts |
| Successful Sessions | XX,XXX | Sessions established |
| Session Restore Success | XX.X% | Sessions restored after refresh |
| Messages Signed | XX,XXX | Enabled by PartyLayer |

### Stability Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| Error Rate | X.X% | Errors / total operations |
| Most Common Error | USER_REJECTED | User-initiated cancellations |
| Uptime | XX.X% | SDK availability |

### Growth Trends

| Metric | Current Month | Previous Month | Change |
|--------|---------------|----------------|--------|
| MAD | XX | XX | +XX% |
| Sessions | XX,XXX | XX,XXX | +XX% |
| New Integrations | XX | XX | +XX% |

---

## Network Contribution

### How PartyLayer Contributes to Canton Network

1. **Reduces Integration Friction**
   - Single SDK instead of 4+ wallet-specific integrations
   - Developers save weeks of integration time

2. **Increases Wallet Adoption**
   - dApps instantly support all major wallets
   - Users can use their preferred wallet

3. **Improves Security**
   - Standardized security practices
   - Encrypted session storage
   - Origin binding prevents hijacking

4. **Enables Ecosystem Growth**
   - Lower barrier to entry for new dApps
   - Consistent UX across applications

### Counterfactual Analysis

Without PartyLayer:
- Each dApp would need to integrate each wallet separately
- 4 wallets × N dApps = 4N separate integrations
- Security practices would vary across implementations
- User experience would be fragmented

With PartyLayer:
- N dApps × 1 SDK = N integrations
- Standardized security across all dApps
- Consistent user experience

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      dApp Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              @partylayer/react (Hooks/UI)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   @partylayer/sdk (Core)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Session Management │ Event System │ Encrypted Store │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │ Console  │        │  Loop    │        │ Cantor8  │
   │ Adapter  │        │ Adapter  │        │ Adapter  │
   └──────────┘        └──────────┘        └──────────┘
```

---

## Open Source Commitment

- **Repository:** https://github.com/cayvox/PartyLayer
- **License:** MIT
- **Documentation:** Complete API reference
- **Examples:** Working demo applications

---

## Attachments

1. `metrics-YYYY-MM.csv` - Raw metrics export
2. `architecture-diagram.png` - Technical architecture
3. `security-audit.pdf` - Security review (if available)

---

## Contact

- **Project Lead:** [Name]
- **Email:** [email]
- **GitHub:** https://github.com/cayvox/PartyLayer
- **Website:** https://partylayer.xyz

---

## Appendix: Metrics Definitions

| Metric | Definition | Collection Method |
|--------|------------|-------------------|
| Monthly Active dApps | Unique app IDs with ≥1 event in 30 days | Hashed app identifier |
| Wallet Connect Attempts | `connect()` calls | SDK telemetry |
| Successful Sessions | `session:connected` events | SDK telemetry |
| Session Restore Success | `sessions_restored / restore_attempts` | SDK telemetry |
| Error Rate | Errors / (Attempts + Operations) | SDK telemetry |

### Privacy Note

All metrics are collected with user privacy in mind:
- No wallet addresses collected
- No user identifiers
- App identifiers are hashed
- Telemetry is opt-in only
