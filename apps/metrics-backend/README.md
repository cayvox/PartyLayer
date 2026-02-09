# PartyLayer Metrics Backend

Cloudflare Workers + D1 based metrics aggregation service for PartyLayer SDK.

## Overview

This backend receives metrics from PartyLayer SDK instances, aggregates them, and provides APIs for querying and exporting metrics for App Rewards reporting.

## Features

- **Privacy-Safe**: Validates all incoming payloads for PII
- **Efficient**: Uses D1 (SQLite) for fast queries
- **Scheduled Aggregation**: Daily and monthly rollups via cron
- **Export Ready**: CSV/JSON export for Canton Foundation reports

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Create D1 Database

```bash
wrangler d1 create partylayer-metrics
```

Update `wrangler.toml` with the returned database ID.

### 3. Initialize Schema

```bash
# Local development
pnpm db:init

# Production
pnpm db:init:remote
```

### 4. Set API Key (Production)

```bash
wrangler secret put API_KEY
```

## Development

```bash
pnpm dev
```

The worker runs at http://localhost:8787

## Deployment

```bash
pnpm deploy
```

## API Endpoints

### POST /api/v1/events

Receive metrics from SDK.

**Request:**
```json
{
  "sdkVersion": "0.3.0",
  "network": "devnet",
  "timestamp": 1706889600000,
  "metrics": {
    "wallet_connect_attempts": 1,
    "wallet_connect_success": 1
  },
  "appIdHash": "abc123..."
}
```

**Response:**
```json
{ "success": true }
```

### GET /api/v1/metrics

Query aggregated metrics.

**Query Parameters:**
- `period`: `daily` or `monthly` (default: `daily`)
- `date`: `YYYY-MM-DD` for daily, `YYYY-MM` for monthly
- `network`: Filter by network (optional)

**Response:**
```json
{
  "period": "daily",
  "date": "2026-02-01",
  "network": "all",
  "metrics": {
    "wallet_connect_attempts": { "value": 150, "uniqueApps": 5 },
    "wallet_connect_success": { "value": 142, "uniqueApps": 5 }
  }
}
```

### GET /api/v1/export

Export metrics for reporting. Requires API key.

**Query Parameters:**
- `format`: `json` or `csv` (default: `json`)
- `month`: `YYYY-MM` (required)
- `network`: Filter by network (optional)

**Response (JSON):**
```json
{
  "month": "2026-02",
  "summary": {
    "monthlyActiveApps": 47,
    "totalSessions": 12340,
    "restoreSuccessRate": 94.2
  },
  "details": [...]
}
```

### GET /health

Health check endpoint.

## CLI Export Tool

```bash
# Export last month's metrics as CSV
pnpm export --month=2026-02 --format=csv

# Export with custom endpoint
pnpm export --month=2026-02 --endpoint=https://metrics.partylayer.xyz --api-key=xxx
```

## Database Schema

### events
Raw events, 24h retention.

### daily_aggregates
Daily rollups of metrics.

### monthly_aggregates
Monthly rollups for reporting.

### app_activity
Tracks unique apps for MAD calculation.

## Scheduled Jobs

- **Daily (00:00 UTC)**: Aggregate yesterday's events, cleanup old data
- **Monthly (1st, 00:00 UTC)**: Roll up daily aggregates to monthly

## Environment Variables

- `ENVIRONMENT`: `production` or `development`
- `API_KEY`: Secret key for export endpoint (set via `wrangler secret`)

## Security

- All payloads validated for PII before storage
- Export endpoint requires API key
- CORS enabled for SDK communication
- No user-identifiable data stored

## Related

- [PartyLayer SDK](../../packages/sdk)
- [METRICS.md](../../docs/METRICS.md)
