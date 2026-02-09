import { useState, useEffect } from 'react';
import { MetricCard } from './components/MetricCard';
import { DatePicker } from './components/DatePicker';
import { ExportButton } from './components/ExportButton';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

interface MetricsData {
  period: string;
  date: string;
  network: string;
  metrics: Record<string, { value: number; uniqueApps: number }>;
}

export function App() {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [date, setDate] = useState(getCurrentMonth());
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [period, date]);

  async function fetchMetrics() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/metrics?period=${period}&date=${date}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }

  const getMetric = (name: string) => metrics?.metrics?.[name]?.value ?? 0;
  const getUniqueApps = (name: string) => metrics?.metrics?.[name]?.uniqueApps ?? 0;

  const totalSessions = getMetric('sessions_created') + getMetric('sessions_restored');
  const connectAttempts = getMetric('wallet_connect_attempts');
  const connectSuccess = getMetric('wallet_connect_success');
  const restoreAttempts = getMetric('restore_attempts');
  const restoreSuccess = getMetric('sessions_restored');
  const restoreRate = restoreAttempts > 0 ? (restoreSuccess / restoreAttempts) * 100 : 0;
  
  // Calculate error rate
  let totalErrors = 0;
  if (metrics?.metrics) {
    for (const [name, data] of Object.entries(metrics.metrics)) {
      if (name.startsWith('error_')) {
        totalErrors += data.value;
      }
    }
  }
  const totalOps = connectAttempts + restoreAttempts;
  const errorRate = totalOps > 0 ? (totalErrors / totalOps) * 100 : 0;

  // Get max unique apps
  let maxUniqueApps = 0;
  if (metrics?.metrics) {
    for (const data of Object.values(metrics.metrics)) {
      if (data.uniqueApps > maxUniqueApps) {
        maxUniqueApps = data.uniqueApps;
      }
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600 }}>PartyLayer Metrics</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <DatePicker 
            period={period} 
            date={date} 
            onPeriodChange={setPeriod}
            onDateChange={setDate}
          />
          <ExportButton date={date} apiBase={API_BASE} />
        </div>
      </header>

      {/* Error state */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fed7d7',
          color: '#c53030',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#718096' }}>
          Loading metrics...
        </div>
      )}

      {/* Metrics Grid */}
      {!loading && !error && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <MetricCard 
              title="Monthly Active dApps"
              value={maxUniqueApps}
              subtitle="Unique apps with activity"
              color="#4299e1"
            />
            <MetricCard 
              title="Sessions Enabled"
              value={totalSessions}
              subtitle={`${getMetric('sessions_created')} new, ${getMetric('sessions_restored')} restored`}
              color="#48bb78"
            />
            <MetricCard 
              title="Restore Success Rate"
              value={`${restoreRate.toFixed(1)}%`}
              subtitle={`${restoreSuccess}/${restoreAttempts} attempts`}
              color="#9f7aea"
            />
            <MetricCard 
              title="Connect Success"
              value={connectSuccess}
              subtitle={`${connectAttempts} attempts`}
              color="#ed8936"
            />
            <MetricCard 
              title="Error Rate"
              value={`${errorRate.toFixed(1)}%`}
              subtitle={`${totalErrors} total errors`}
              color={errorRate > 10 ? '#e53e3e' : '#718096'}
            />
          </div>

          {/* Detailed Metrics Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px'
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>All Metrics</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', color: '#718096' }}>Metric</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#718096' }}>Value</th>
                  <th style={{ textAlign: 'right', padding: '12px', color: '#718096' }}>Unique Apps</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.metrics && Object.entries(metrics.metrics)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([name, data]) => (
                    <tr key={name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px' }}>
                        {name}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                        {data.value.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#718096' }}>
                        {data.uniqueApps}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '48px', textAlign: 'center', color: '#a0aec0', fontSize: '14px' }}>
        PartyLayer Metrics Dashboard • {new Date().toISOString().slice(0, 10)}
      </footer>
    </div>
  );
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
