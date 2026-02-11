'use client';

import { useState, useEffect, useCallback } from 'react';
import { PartyLayerProvider, usePartyLayer, useRegistryStatus } from '@partylayer/react';
import { createPartyLayer } from '@partylayer/sdk';
import type { PartyLayerClient, PartyLayerEvent } from '@partylayer/sdk';
import { ConsoleAdapter } from '@partylayer/adapter-console';
import { LoopAdapter } from '@partylayer/adapter-loop';
import {
  discoverInjectedProviders,
  isCIP0103Provider,
  type DiscoveredProvider,
} from '@partylayer/provider';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// ─── CIP-0103 Discovery Panel ─────────────────────────────────────────────

interface ProviderProbeResult {
  id: string;
  source: string;
  hasRequest: boolean;
  hasOn: boolean;
  hasEmit: boolean;
  hasRemoveListener: boolean;
  statusResult?: unknown;
  statusError?: string;
}

function DiscoveryPanel() {
  const [discovered, setDiscovered] = useState<DiscoveredProvider[]>([]);
  const [probeResults, setProbeResults] = useState<ProviderProbeResult[]>([]);
  const [windowScan, setWindowScan] = useState<Record<string, string>>({});
  const [isProbing, setIsProbing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  const scanWindow = useCallback(() => {
    if (typeof window === 'undefined') return;

    const win = window as unknown as Record<string, unknown>;
    const paths = ['canton', 'cantonWallet', 'consoleWallet', 'splice', 'spliceWallet', 'ethereum'];
    const scan: Record<string, string> = {};

    for (const path of paths) {
      const val = win[path];
      if (val === undefined) {
        scan[`window.${path}`] = 'undefined';
      } else if (val === null) {
        scan[`window.${path}`] = 'null';
      } else if (typeof val === 'object') {
        const keys = Object.keys(val as Record<string, unknown>);
        const isCIP = isCIP0103Provider(val);
        if (isCIP) {
          scan[`window.${path}`] = `CIP-0103 Provider (direct)`;
        } else if (keys.length > 0) {
          scan[`window.${path}`] = `Namespace { ${keys.join(', ')} }`;
          // Scan sub-keys
          for (const key of keys) {
            const sub = (val as Record<string, unknown>)[key];
            if (sub && typeof sub === 'object') {
              const subIsCIP = isCIP0103Provider(sub);
              scan[`window.${path}.${key}`] = subIsCIP
                ? 'CIP-0103 Provider'
                : `Object (not CIP-0103)`;
            } else {
              scan[`window.${path}.${key}`] = `${typeof sub}`;
            }
          }
        } else {
          scan[`window.${path}`] = 'Empty object {}';
        }
      } else {
        scan[`window.${path}`] = `${typeof val} (not a provider)`;
      }
    }

    setWindowScan(scan);
    setLastScanTime(new Date().toLocaleTimeString());
  }, []);

  const runDiscovery = useCallback(() => {
    const providers = discoverInjectedProviders();
    setDiscovered(providers);
    scanWindow();
    return providers;
  }, [scanWindow]);

  const probeProviders = useCallback(async (providers: DiscoveredProvider[]) => {
    setIsProbing(true);
    const results: ProviderProbeResult[] = [];

    for (const p of providers) {
      const result: ProviderProbeResult = {
        id: p.id,
        source: p.source,
        hasRequest: typeof p.provider.request === 'function',
        hasOn: typeof p.provider.on === 'function',
        hasEmit: typeof p.provider.emit === 'function',
        hasRemoveListener: typeof p.provider.removeListener === 'function',
      };

      // Try calling status() to see if the provider is functional
      try {
        const statusResult = await p.provider.request({ method: 'status' });
        result.statusResult = statusResult;
      } catch (err: unknown) {
        result.statusError = err instanceof Error ? err.message : String(err);
        if (typeof err === 'object' && err !== null && 'code' in err) {
          result.statusError += ` (code: ${(err as { code: number }).code})`;
        }
      }

      results.push(result);
    }

    setProbeResults(results);
    setIsProbing(false);
  }, []);

  // Auto-scan on mount + periodic rescan
  useEffect(() => {
    // Initial scan after a small delay (extensions may inject late)
    const initialTimer = setTimeout(() => {
      runDiscovery();
    }, 500);

    // Rescan every 3 seconds for late-injecting extensions
    const interval = setInterval(() => {
      runDiscovery();
    }, 3000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [runDiscovery]);

  const handleProbe = () => {
    const providers = runDiscovery();
    void probeProviders(providers);
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h2>CIP-0103 Wallet Discovery</h2>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
        Scans <code>window.canton.*</code>, <code>window.consoleWallet</code>,{' '}
        <code>window.cantonWallet</code>, <code>window.splice</code> for CIP-0103 Providers.
        {lastScanTime && <> Last scan: {lastScanTime}</>}
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => runDiscovery()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Scan Now
        </button>
        <button
          onClick={handleProbe}
          disabled={isProbing}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: isProbing ? 0.6 : 1,
          }}
        >
          {isProbing ? 'Probing...' : 'Scan + Probe (call status())'}
        </button>
      </div>

      {/* Window Property Scan */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Window Properties</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>Path</th>
              <th style={{ padding: '6px 8px' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(windowScan).map(([path, value]) => (
              <tr
                key={path}
                style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: value.includes('CIP-0103') ? '#e8f5e9' : 'transparent',
                }}
              >
                <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{path}</td>
                <td
                  style={{
                    padding: '6px 8px',
                    color: value === 'undefined' ? '#999' : value.includes('CIP-0103') ? '#2e7d32' : '#333',
                    fontWeight: value.includes('CIP-0103') ? 'bold' : 'normal',
                  }}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Discovered Providers */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>
          Discovered Providers ({discovered.length})
        </h3>
        {discovered.length === 0 ? (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fff3e0',
              borderRadius: '4px',
              border: '1px solid #ffcc80',
              fontSize: '13px',
            }}
          >
            <strong>No CIP-0103 providers found.</strong>
            <br />
            Install a Canton wallet extension (e.g. Console Wallet) or check if a wallet injects at{' '}
            <code>window.canton.*</code>.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>ID</th>
                <th style={{ padding: '6px 8px' }}>Source</th>
                <th style={{ padding: '6px 8px' }}>Interface</th>
                <th style={{ padding: '6px 8px' }}>Status Probe</th>
              </tr>
            </thead>
            <tbody>
              {discovered.map((p) => {
                const probe = probeResults.find((r) => r.id === p.id);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {p.id}
                    </td>
                    <td style={{ padding: '6px 8px' }}>{p.source}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '11px' }}>
                      {probe ? (
                        <>
                          request: {probe.hasRequest ? 'Y' : 'N'} | on: {probe.hasOn ? 'Y' : 'N'} |
                          emit: {probe.hasEmit ? 'Y' : 'N'} | removeListener:{' '}
                          {probe.hasRemoveListener ? 'Y' : 'N'}
                        </>
                      ) : (
                        'Click Probe'
                      )}
                    </td>
                    <td style={{ padding: '6px 8px', fontSize: '11px' }}>
                      {probe?.statusResult ? (
                        <pre style={{ margin: 0, maxWidth: '300px', overflow: 'auto' }}>
                          {JSON.stringify(probe.statusResult, null, 2)}
                        </pre>
                      ) : probe?.statusError ? (
                        <span style={{ color: '#d32f2f' }}>{probe.statusError}</span>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Debug Page Content ────────────────────────────────────────────────────

function DebugPageContent() {
  const client = usePartyLayer();
  const { status: registryStatus, refresh: refreshRegistry } = useRegistryStatus();
  const [events, setEvents] = useState<PartyLayerEvent[]>([]);

  useEffect(() => {
    // Subscribe to all events
    const unsubscribeConnect = client.on('session:connected', (event) => {
      setEvents((prev) => [...prev, event]);
    });

    const unsubscribeDisconnect = client.on('session:disconnected', (event) => {
      setEvents((prev) => [...prev, event]);
    });

    const unsubscribeExpired = client.on('session:expired', (event) => {
      setEvents((prev) => [...prev, event]);
    });

    const unsubscribeTxStatus = client.on('tx:status', (event) => {
      setEvents((prev) => [...prev, event]);
    });

    const unsubscribeError = client.on('error', (event) => {
      setEvents((prev) => [...prev, event]);
    });

    const unsubscribeRegistry = client.on('registry:status', (event) => {
      setEvents((prev) => [...prev, event]);
    });

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeExpired();
      unsubscribeTxStatus();
      unsubscribeError();
      unsubscribeRegistry();
    };
  }, [client]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Debug Page</h1>

      {/* CIP-0103 Discovery Panel - first section */}
      <DiscoveryPanel />

      <div style={{ marginTop: '24px' }}>
        <h2>Registry Status</h2>
        <div style={{ marginBottom: '12px' }}>
        <button
          onClick={() => {
            void refreshRegistry();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Refresh Registry
        </button>
        </div>
        {registryStatus ? (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
          >
            <pre>{JSON.stringify(registryStatus, null, 2)}</pre>
            {registryStatus.error && (
              <div style={{ marginTop: '8px', color: '#d32f2f' }}>
                <strong>Error:</strong> {registryStatus.error.code} - {registryStatus.error.message}
              </div>
            )}
          </div>
        ) : (
          <div>No registry status available</div>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <h2>Event Log</h2>
        <div
          style={{
            maxHeight: '400px',
            overflow: 'auto',
            border: '1px solid #ccc',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          {events.length === 0 ? (
            <div>No events yet</div>
          ) : (
            events.map((event, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <strong>[{new Date().toLocaleTimeString()}]</strong> {event.type}
                <pre style={{ margin: '4px 0', fontSize: '11px' }}>
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setEvents([])}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear Events
        </button>
      </div>
    </div>
  );
}

function DebugPageWrapper() {
  const [client, setClient] = useState<PartyLayerClient | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cantonClient = createPartyLayer({
      registryUrl: process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:3001',
      channel: (process.env.NEXT_PUBLIC_REGISTRY_CHANNEL as 'stable' | 'beta') || 'stable',
      network: (process.env.NEXT_PUBLIC_NETWORK as 'devnet' | 'testnet' | 'mainnet') || 'devnet',
      app: {
        name: 'PartyLayer Demo Debug',
        origin: window.location.origin,
      },
    });

    const clientInternal = cantonClient as unknown as {
      registerAdapter: (adapter: unknown) => void;
    };
    clientInternal.registerAdapter(new ConsoleAdapter());
    clientInternal.registerAdapter(new LoopAdapter());

    setClient(cantonClient);

    return () => {
      cantonClient.destroy();
    };
  }, []);

  if (!client) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Debug Page</h1>
        <p>Initializing...</p>
      </div>
    );
  }

  return (
    <PartyLayerProvider client={client}>
      <DebugPageContent />
    </PartyLayerProvider>
  );
}

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Debug Page</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return <DebugPageWrapper />;
}
