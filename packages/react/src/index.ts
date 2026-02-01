/**
 * @partylayer/react
 * React hooks and components for PartyLayer
 */

export * from './context';
export * from './hooks';
export * from './modal';

// Backward compatibility aliases
export { PartyLayerProvider as CantonConnectProvider } from './context';
export { usePartyLayer as useCantonConnect } from './hooks';

// Re-export registry status type
export type { RegistryStatus } from '@partylayer/registry-client';
