'use client';

import { useEffect, useState } from 'react';
import { PartyLayerProvider } from '@partylayer/react';
import { createPartyLayer } from '@partylayer/sdk';
import type { PartyLayerClient } from '@partylayer/sdk';
import { ConsoleAdapter } from '@partylayer/adapter-console';
import { LoopAdapter } from '@partylayer/adapter-loop';
import { Cantor8Adapter } from '@partylayer/adapter-cantor8';
import { BronAdapter } from '@partylayer/adapter-bron';
import { DemoApp } from './components/DemoApp';

/**
 * Client-side only wrapper to initialize PartyLayer
 * This ensures window APIs are available before adapters are registered
 */
function PartyLayerWrapper({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<PartyLayerClient | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Create PartyLayer client using public API
    const cantonClient = createPartyLayer({
      registryUrl:
        process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:3001',
      channel:
        (process.env.NEXT_PUBLIC_REGISTRY_CHANNEL as 'stable' | 'beta') ||
        'stable',
      network:
        (process.env.NEXT_PUBLIC_NETWORK as 'devnet' | 'testnet' | 'mainnet') ||
        'devnet',
      app: {
        name: 'PartyLayer Demo',
        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    // Register adapters only on client side
    // Note: In production, adapters would be auto-registered via registry
    // For demo, we register them manually
    const clientInternal = cantonClient as unknown as {
      registerAdapter: (adapter: unknown) => void;
    };
    clientInternal.registerAdapter(new ConsoleAdapter());
    clientInternal.registerAdapter(new LoopAdapter());
    clientInternal.registerAdapter(new Cantor8Adapter());
    clientInternal.registerAdapter(new BronAdapter({
      auth: {
        clientId: process.env.NEXT_PUBLIC_BRON_CLIENT_ID || 'demo-client-id',
        redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback',
        authorizationUrl: process.env.NEXT_PUBLIC_BRON_AUTH_URL || 'https://auth.bron.example/authorize',
        tokenUrl: process.env.NEXT_PUBLIC_BRON_TOKEN_URL || 'https://auth.bron.example/token',
      },
      api: {
        baseUrl: process.env.NEXT_PUBLIC_BRON_API_URL || 'https://api.bron.example',
        getAccessToken: () => Promise.resolve(null), // Not used when useMockApi is true
      },
      useMockApi: true, // Use mock API for demo
    }));

    setClient(cantonClient);

    // Cleanup on unmount
    return () => {
      cantonClient.destroy();
    };
  }, []);

  if (!client) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Initializing PartyLayer...</p>
      </div>
    );
  }

  return (
    <PartyLayerProvider client={client}>{children}</PartyLayerProvider>
  );
}

export default function Home() {
  return (
    <PartyLayerWrapper>
      <DemoApp />
    </PartyLayerWrapper>
  );
}
