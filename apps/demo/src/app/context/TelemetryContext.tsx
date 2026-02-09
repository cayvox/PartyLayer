'use client';

import { createContext, useContext } from 'react';

export interface TelemetryContextValue {
  telemetryEnabled: boolean;
  onToggle: () => void;
  getMetrics: () => Record<string, number>;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    // Return a no-op context if not available
    return {
      telemetryEnabled: false,
      onToggle: () => {},
      getMetrics: () => ({}),
    };
  }
  return context;
}
