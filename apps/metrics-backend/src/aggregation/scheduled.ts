/**
 * Scheduled aggregation jobs
 * 
 * Runs via Cloudflare Workers cron triggers.
 */

import type { Env } from '../index';

/**
 * Run daily aggregation
 * 
 * Aggregates yesterday's raw events into daily_aggregates table.
 */
export async function runDailyAggregation(env: Env): Promise<void> {
  console.log('Running daily aggregation...');
  
  const yesterday = getYesterday();
  const startOfYesterday = new Date(yesterday).getTime();
  const endOfYesterday = startOfYesterday + 24 * 60 * 60 * 1000;
  
  // Get all events from yesterday
  const events = await env.DB.prepare(`
    SELECT network, metrics, app_id_hash
    FROM events
    WHERE created_at >= ? AND created_at < ?
  `).bind(startOfYesterday, endOfYesterday).all();
  
  if (events.results.length === 0) {
    console.log('No events to aggregate for', yesterday);
    return;
  }
  
  // Aggregate metrics by network
  const aggregates = new Map<string, Map<string, { value: number; apps: Set<string> }>>();
  
  for (const row of events.results as EventRow[]) {
    const network = row.network;
    const appId = row.app_id_hash;
    
    if (!aggregates.has(network)) {
      aggregates.set(network, new Map());
    }
    
    const networkAgg = aggregates.get(network)!;
    const metrics = JSON.parse(row.metrics) as Record<string, number>;
    
    for (const [metricName, value] of Object.entries(metrics)) {
      if (!networkAgg.has(metricName)) {
        networkAgg.set(metricName, { value: 0, apps: new Set() });
      }
      
      const metricAgg = networkAgg.get(metricName)!;
      metricAgg.value += value;
      if (appId) {
        metricAgg.apps.add(appId);
      }
    }
  }
  
  // Insert into daily_aggregates
  for (const [network, metrics] of aggregates) {
    for (const [metricName, data] of metrics) {
      await env.DB.prepare(`
        INSERT INTO daily_aggregates (date, network, metric_name, metric_value, unique_apps)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(date, network, metric_name) 
        DO UPDATE SET metric_value = metric_value + excluded.metric_value,
                      unique_apps = MAX(unique_apps, excluded.unique_apps)
      `).bind(yesterday, network, metricName, data.value, data.apps.size).run();
    }
  }
  
  console.log(`Daily aggregation complete for ${yesterday}. Processed ${events.results.length} events.`);
}

/**
 * Run monthly aggregation
 * 
 * Aggregates previous month's daily aggregates into monthly_aggregates.
 */
export async function runMonthlyAggregation(env: Env): Promise<void> {
  console.log('Running monthly aggregation...');
  
  const lastMonth = getLastMonth();
  const monthStart = `${lastMonth}-01`;
  const monthEnd = `${lastMonth}-31`; // Will work for all months
  
  // Get all daily aggregates from last month
  const dailyAggs = await env.DB.prepare(`
    SELECT network, metric_name, SUM(metric_value) as total_value, MAX(unique_apps) as max_apps
    FROM daily_aggregates
    WHERE date >= ? AND date <= ?
    GROUP BY network, metric_name
  `).bind(monthStart, monthEnd).all();
  
  if (dailyAggs.results.length === 0) {
    console.log('No daily aggregates to roll up for', lastMonth);
    return;
  }
  
  // Insert into monthly_aggregates
  for (const row of dailyAggs.results as MonthlyRow[]) {
    await env.DB.prepare(`
      INSERT INTO monthly_aggregates (month, network, metric_name, metric_value, unique_apps)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(month, network, metric_name) 
      DO UPDATE SET metric_value = excluded.metric_value,
                    unique_apps = excluded.unique_apps
    `).bind(lastMonth, row.network, row.metric_name, row.total_value, row.max_apps).run();
  }
  
  console.log(`Monthly aggregation complete for ${lastMonth}. Rolled up ${dailyAggs.results.length} metrics.`);
}

/**
 * Cleanup old raw events
 * 
 * Deletes events older than 24 hours to keep database size manageable.
 */
export async function cleanupOldEvents(env: Env): Promise<void> {
  console.log('Cleaning up old events...');
  
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
  
  const result = await env.DB.prepare(`
    DELETE FROM events WHERE created_at < ?
  `).bind(cutoff).run();
  
  console.log(`Cleanup complete. Deleted ${result.meta.changes} old events.`);
}

interface EventRow {
  network: string;
  metrics: string;
  app_id_hash: string;
}

interface MonthlyRow {
  network: string;
  metric_name: string;
  total_value: number;
  max_apps: number;
}

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function getLastMonth(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}
