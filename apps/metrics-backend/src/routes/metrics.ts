/**
 * GET /api/v1/metrics
 * 
 * Query aggregated metrics.
 * 
 * Query params:
 * - period: 'daily' | 'monthly' (default: 'daily')
 * - date: YYYY-MM-DD (for daily) or YYYY-MM (for monthly)
 * - network: network filter (optional)
 */

import type { Env } from '../index';

export async function handleMetrics(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'daily';
    const date = url.searchParams.get('date');
    const network = url.searchParams.get('network');
    
    let query: string;
    let params: (string | null)[] = [];
    
    if (period === 'monthly') {
      // Query monthly aggregates
      const month = date || getCurrentMonth();
      query = `
        SELECT month, network, metric_name, metric_value, unique_apps
        FROM monthly_aggregates
        WHERE month = ?
      `;
      params = [month];
      
      if (network) {
        query += ' AND network = ?';
        params.push(network);
      }
      
      query += ' ORDER BY metric_name';
    } else {
      // Query daily aggregates
      const targetDate = date || getYesterday();
      query = `
        SELECT date, network, metric_name, metric_value, unique_apps
        FROM daily_aggregates
        WHERE date = ?
      `;
      params = [targetDate];
      
      if (network) {
        query += ' AND network = ?';
        params.push(network);
      }
      
      query += ' ORDER BY metric_name';
    }
    
    const result = await env.DB.prepare(query).bind(...params).all();
    
    // Format response
    const response = {
      period,
      date: date || (period === 'monthly' ? getCurrentMonth() : getYesterday()),
      network: network || 'all',
      metrics: formatMetrics(result.results as MetricRow[]),
    };
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error querying metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to query metrics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

interface MetricRow {
  date?: string;
  month?: string;
  network: string;
  metric_name: string;
  metric_value: number;
  unique_apps: number;
}

function formatMetrics(rows: MetricRow[]): Record<string, { value: number; uniqueApps: number }> {
  const result: Record<string, { value: number; uniqueApps: number }> = {};
  
  for (const row of rows) {
    result[row.metric_name] = {
      value: row.metric_value,
      uniqueApps: row.unique_apps,
    };
  }
  
  return result;
}

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
