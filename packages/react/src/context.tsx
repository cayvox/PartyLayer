/**
 * React context for PartyLayer
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type {
  PartyLayerClient,
  Session,
  WalletInfo,
} from '@partylayer/sdk';

interface PartyLayerContextValue {
  client: PartyLayerClient | null;
  session: Session | null;
  wallets: WalletInfo[];
  isLoading: boolean;
  error: Error | null;
}

const PartyLayerContext =
  createContext<PartyLayerContextValue | null>(null);

export function usePartyLayerContext(): PartyLayerContextValue {
  const context = useContext(PartyLayerContext);
  if (!context) {
    throw new Error(
      'usePartyLayer must be used within PartyLayerProvider'
    );
  }
  return context;
}

interface PartyLayerProviderProps {
  client: PartyLayerClient;
  children: React.ReactNode;
}

export function PartyLayerProvider({
  client,
  children,
}: PartyLayerProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [sessionData, walletsData] = await Promise.all([
          client.getActiveSession(),
          client.listWallets(),
        ]);

        if (mounted) {
          setSession(sessionData);
          setWallets(walletsData);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setWallets([]); // Ensure wallets is empty array on error
          setIsLoading(false);
        }
      }
    }

    load();

    // Subscribe to events
    const unsubscribeConnect = client.on('session:connected', (event) => {
      if (!mounted) return;
      if (event.type === 'session:connected') {
        setSession(event.session);
      }
    });

    const unsubscribeDisconnect = client.on('session:disconnected', () => {
      if (!mounted) return;
      setSession(null);
    });

    const unsubscribeExpired = client.on('session:expired', () => {
      if (!mounted) return;
      setSession(null);
    });

    const unsubscribeError = client.on('error', (event) => {
      if (!mounted) return;
      if (event.type === 'error') {
        setError(event.error);
      }
    });

    return () => {
      mounted = false;
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeExpired();
      unsubscribeError();
    };
  }, [client]);

  return (
    <PartyLayerContext.Provider
      value={{
        client,
        session,
        wallets,
        isLoading,
        error,
      }}
    >
      {children}
    </PartyLayerContext.Provider>
  );
}
