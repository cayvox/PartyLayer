-- PartyLayer Metrics Database Schema
-- D1 (SQLite-compatible)

-- Raw events (24h retention)
-- Stores incoming metrics payloads for processing
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id_hash TEXT,
  sdk_version TEXT NOT NULL,
  network TEXT NOT NULL,
  metrics TEXT NOT NULL,  -- JSON blob
  created_at INTEGER NOT NULL
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

-- Daily aggregates
-- Rolled up from raw events each night
CREATE TABLE IF NOT EXISTS daily_aggregates (
  date TEXT NOT NULL,           -- YYYY-MM-DD
  network TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  unique_apps INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, network, metric_name)
);

-- Index for querying by date range
CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_aggregates(date);

-- Monthly aggregates
-- Rolled up from daily aggregates on 1st of each month
CREATE TABLE IF NOT EXISTS monthly_aggregates (
  month TEXT NOT NULL,          -- YYYY-MM
  network TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 0,
  unique_apps INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (month, network, metric_name)
);

-- Index for querying by month
CREATE INDEX IF NOT EXISTS idx_monthly_month ON monthly_aggregates(month);

-- Unique apps tracking (for MAD calculation)
CREATE TABLE IF NOT EXISTS app_activity (
  app_id_hash TEXT NOT NULL,
  network TEXT NOT NULL,
  date TEXT NOT NULL,           -- YYYY-MM-DD
  event_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (app_id_hash, network, date)
);

-- Index for unique app queries
CREATE INDEX IF NOT EXISTS idx_app_activity_date ON app_activity(date);
