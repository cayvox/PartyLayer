/**
 * GET /api/v1/export
 * 
 * Export metrics for App Rewards reporting.
 * 
 * Query params:
 * - format: 'json' | 'csv' (default: 'json')
 * - month: YYYY-MM (required)
 * - network: network filter (optional)
 */

import type { Env } from '../index';

export async function handleExport(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const month = url.searchParams.get('month');
    const network = url.searchParams.get('network');
    
    if (!month) {
      return new Response(
        JSON.stringify({ error: 'month parameter is required (YYYY-MM)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get monthly aggregates
    let query = `
      SELECT month, network, metric_name, metric_value, unique_apps
      FROM monthly_aggregates
      WHERE month = ?
    `;
    const params: string[] = [month];
    
    if (network) {
      query += ' AND network = ?';
      params.push(network);
    }
    
    query += ' ORDER BY network, metric_name';
    
    const result = await env.DB.prepare(query).bind(...params).all();
    const rows = result.results as ExportRow[];
    
    // Calculate summary metrics
    const summary = calculateSummary(rows);
    
    if (format === 'csv') {
      const csv = formatAsCsv(rows, summary);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="partylayer-metrics-${month}.csv"`,
        },
      });
    }
    
    // JSON format
    return new Response(JSON.stringify({
      month,
      network: network || 'all',
      exportedAt: new Date().toISOString(),
      summary,
      details: rows,
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exporting metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to export metrics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

interface ExportRow {
  month: string;
  network: string;
  metric_name: string;
  metric_value: number;
  unique_apps: number;
}

interface Summary {
  monthlyActiveApps: number;
  totalSessions: number;
  restoreSuccessRate: number;
  walletConnectAttempts: number;
  walletConnectSuccess: number;
  errorRate: number;
}

function calculateSummary(rows: ExportRow[]): Summary {
  const metrics: Record<string, number> = {};
  let maxUniqueApps = 0;
  
  for (const row of rows) {
    metrics[row.metric_name] = (metrics[row.metric_name] || 0) + row.metric_value;
    if (row.unique_apps > maxUniqueApps) {
      maxUniqueApps = row.unique_apps;
    }
  }
  
  const connectAttempts = metrics['wallet_connect_attempts'] || 0;
  const connectSuccess = metrics['wallet_connect_success'] || 0;
  const sessionsCreated = metrics['sessions_created'] || 0;
  const sessionsRestored = metrics['sessions_restored'] || 0;
  const restoreAttempts = metrics['restore_attempts'] || 0;
  
  // Calculate total errors
  let totalErrors = 0;
  for (const [name, value] of Object.entries(metrics)) {
    if (name.startsWith('error_')) {
      totalErrors += value;
    }
  }
  
  const totalOperations = connectAttempts + restoreAttempts;
  
  return {
    monthlyActiveApps: maxUniqueApps,
    totalSessions: sessionsCreated + sessionsRestored,
    restoreSuccessRate: restoreAttempts > 0 ? (sessionsRestored / restoreAttempts) * 100 : 0,
    walletConnectAttempts: connectAttempts,
    walletConnectSuccess: connectSuccess,
    errorRate: totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0,
  };
}

function formatAsCsv(rows: ExportRow[], summary: Summary): string {
  const lines: string[] = [];
  
  // Header
  lines.push('# PartyLayer Metrics Export');
  lines.push(`# Month: ${rows[0]?.month || 'N/A'}`);
  lines.push(`# Exported: ${new Date().toISOString()}`);
  lines.push('');
  
  // Summary
  lines.push('# Summary');
  lines.push(`Monthly Active Apps,${summary.monthlyActiveApps}`);
  lines.push(`Total Sessions,${summary.totalSessions}`);
  lines.push(`Restore Success Rate,${summary.restoreSuccessRate.toFixed(1)}%`);
  lines.push(`Connect Attempts,${summary.walletConnectAttempts}`);
  lines.push(`Connect Success,${summary.walletConnectSuccess}`);
  lines.push(`Error Rate,${summary.errorRate.toFixed(1)}%`);
  lines.push('');
  
  // Details
  lines.push('# Details');
  lines.push('month,network,metric_name,metric_value,unique_apps');
  
  for (const row of rows) {
    lines.push(`${row.month},${row.network},${row.metric_name},${row.metric_value},${row.unique_apps}`);
  }
  
  return lines.join('\n');
}
